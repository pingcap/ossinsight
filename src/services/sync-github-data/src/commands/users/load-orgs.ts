import {AppConfig} from "@env";
import {Organization, OrganizationType} from "@typings/github";
import async from "async";
import {Command} from "commander";
import {existsSync, readFileSync} from "fs";
import {createPool, Pool, ResultSetHeader} from "mysql2/promise";
import path from "path";
import {Logger} from "pino";
import YAML from "yaml";

/**
 * @sub-command sync-github users load-orgs
 * @description Load organization information from file.
 */
export function initLoadOrgsCommand(command: Command, config: AppConfig, logger: Logger) {
  command.command('load-orgs')
    .description('Load organization information from file.')
    .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 4)
    .action(async (options) => {
      const {concurrent} = options;

      // Init TiDB client.
      const pool = createPool({
        uri: config.DATABASE_URL
      });

      const organizations = loadOrganizationConfig();
      logger.info(`Found ${organizations.length} organizations.`);

      logger.info('Start organization name formatting.');
      await loadOrgsToDatabase(logger, pool, concurrent, organizations);
      logger.info('Finished organization name formatting.');

      pool.end();
    });
}

function loadOrganizationConfig() {
  const configFile = path.resolve(__dirname, '@organizations.yaml');
  if (existsSync(configFile)) {
    const originFile = readFileSync(configFile, 'utf8');
    const {organizations} = YAML.parse(originFile) as { organizations: Organization[] };

    if (Array.isArray(organizations)) {
      return organizations;
    }
  }
  return [];
}

export async function loadOrgsToDatabase(logger: Logger, pool: Pool, concurrent: number, organizations: Organization[]) {
  // Workers ready.
  const queue = async.queue<Organization>(async (org) => {
    if (!org.type) {
      org.type = OrganizationType.COMPANY;
    }

    const orgName = org.name;
    if (!orgName) {
      logger.error('Must provide `type` and `name` filed: ', org);
      return
    }

    try {
      const columns: string[] = [];
      const values: any[] = [];
      for (const [key, value] of Object.entries(org)) {
        if (['type', 'name', 'full_name', 'description'].includes(key)) {
          columns.push(key);
          values.push(value);
        }
      }

      // Import org info.
      const [rs] = await pool.query<ResultSetHeader>(`
          INSERT INTO organizations(${columns.join(',')})
          VALUES ?
          ON DUPLICATE KEY UPDATE ${columns.map(col => `${col} = VALUES(${col})`).join(', ')}
      `, [[values]]);
      const orgId = rs.insertId;
      logger.info(`Added organization named ${orgName} (id = ${orgId}).`);

      // Import org domains.
      if (Array.isArray(org.domains)) {
        await loadOrgDomainsToDatabase(logger, pool, orgId, orgName, org.domains);
      }

      // Import org name patterns.
      if (Array.isArray(org.patterns)) {
        await loadOrgPatternsToDatabase(logger, pool, orgId, orgName, org.patterns);
      }
    } catch (err) {
      logger.error('Failed to add or update organization:', org, err);
    }
  }, concurrent);

  for (const org of organizations) {
    if (queue.started) {
      await queue.unsaturated();
    }
    await queue.push(org);
  }

  await queue.drain();
}

async function loadOrgDomainsToDatabase(logger: Logger, pool: Pool, orgId: number, orgName: string, domains: string[]) {
  try {
    const values = [];
    for (const domain of domains) {
      values.push([orgId, domain]);
    }
    const [rs] = await pool.query<ResultSetHeader>(`
        INSERT INTO organization_domains(org_id, name)
        VALUES ?
        ON DUPLICATE KEY UPDATE org_id = VALUES(org_id),
                                name   = VALUES(name)
    `, [values]);
    logger.info(`Added ${rs.affectedRows} domains for organization ${orgName}.`);
  } catch (err) {
    logger.error(`Failed to add domains for organization ${orgName}: `, err);
  }
}

async function loadOrgPatternsToDatabase(logger: Logger, pool: Pool, orgId: number, orgName: string, patterns: string[]) {
  try {
    const values = [];
    for (const pattern of patterns) {
      values.push([orgId, pattern]);
    }
    const [rs] = await pool.query<ResultSetHeader>(`
        INSERT INTO organization_name_patterns(org_id, pattern)
        VALUES ?
        ON DUPLICATE KEY UPDATE org_id  = VALUES(org_id),
                                pattern = VALUES(pattern)
    `, [values]);
    logger.info(`Added ${rs.affectedRows} name patterns for organization ${orgName}.`);
  } catch (err) {
    logger.error(`Failed to add patterns for organization ${orgName}: `, err);
  }
}
