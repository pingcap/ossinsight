import async from "async";
import { Consola } from "consola";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { DEFAULT_COUNTRY_CODE, DEFAULT_REGION_CODE, Locator } from "../../app/locator/Locator";

const QUERY_ADDRESSES_ORDER_BY_CNT_SQL = `
SELECT
    address, COUNT(1) AS cnt
FROM
    github_users
WHERE
    address IS NOT NULL
    AND address != ''
    AND (country_code IS NULL OR country_code = 'N/A' OR country_code = '')
GROUP BY address
ORDER BY cnt DESC
LIMIT 10000
`;

const UPDATE_FORMAT_ADDRESS_IN_BATCH_SQL = `
UPDATE github_users
SET country_code = ?, region_code = ?, state = ?, city = ?, longitude = ?, latitude = ?
WHERE address = ?
`;

const UPDATE_IS_BOT_BY_EQUAL_SQL = `
UPDATE github_users
SET is_bot = 1
WHERE is_bot = 0 AND login = ?
`;

const UPDATE_IS_BOT_BY_LIKE_SQL = `
UPDATE github_users USE INDEX(index_gu_on_login_is_bot_company_country_code)
SET is_bot = 1
WHERE is_bot = 0 AND login LIKE ?
LIMIT ?
`;

export interface AddressWithCnt {
    address: string;
    cnt: number;
}

export async function formatAddressInBatch(logger: Consola, pool: Pool, geoLocator: Locator, concurrent: number) {
    // Workers ready.
    const queue = async.queue<AddressWithCnt>(async (addressItem) => {
        const { address, cnt } = addressItem;
        try {
            const {
                countryCode = DEFAULT_COUNTRY_CODE, regionCode = DEFAULT_REGION_CODE, state = '', city = '',
                longitude = null, latitude = null
            } = await geoLocator.geocode(address);
            const [rs] = await pool.execute<ResultSetHeader>(UPDATE_FORMAT_ADDRESS_IN_BATCH_SQL, [
                countryCode, regionCode, state, city, longitude, latitude, address
            ]);
            logger.success(
                `Formatted ${rs.affectedRows} / ${cnt} addresses, address: ${address}, country code: ${countryCode}, region code: ${regionCode}.`
            );
        } catch (err) {
            logger.error(`Failed to format address ${address}`, err);
        }
    }, concurrent);

    // Generate jobs.
    let started = false;
    while (true) {
        if (started) {
            await queue.empty();
        }
        started = true;

        const res = await pool.query<any[]>(QUERY_ADDRESSES_ORDER_BY_CNT_SQL);
        const addressItems: AddressWithCnt[] = res[0];

        if (!Array.isArray(addressItems) || addressItems.length === 0) {
            break;
        }
 
        logger.info(`Processing ${addressItems.length} address in ${concurrent} concurrent.`);
        for (let addressItem of addressItems) {
            queue.push(addressItem);
        }
    }
}

export async function identifyBotsInBatch(logger: Consola, pool: Pool, concurrent: number, botLogins: string[]) {
    // Workers ready.
    const queue = async.queue<string>(async (botLogin) => {
        if (!botLogin && botLogin.length === 0) {
            return
        }

        if (botLogin[botLogin.length - 1] === '%') {
            // Fuzzy matching by prefix.
            try {
                while(true) {
                    const batchSize = 1000;
                    const [rs] = await pool.execute<ResultSetHeader>(UPDATE_IS_BOT_BY_LIKE_SQL, [botLogin, batchSize]);
                    logger.success(`Update ${rs.affectedRows} users' \`is_bot\` field by pattern ${botLogin}.`);
                    if (rs.affectedRows >= batchSize) {
                        continue;
                    } else {
                        break;
                    }
                }
            } catch(err) {
                logger.error(`Failed to updated users' info by pattern ${botLogin}: `, err);
            }
        } else {
            // Equal.
            try {
                const [rs] = await pool.execute<ResultSetHeader>(UPDATE_IS_BOT_BY_EQUAL_SQL, [botLogin]);
                logger.success(`Update ${rs.affectedRows} users' \`is_bot\` field by login ${botLogin}.`);
            } catch (err) {
                logger.error(`Failed to updated users' info by login ${botLogin}: `, err);
            }
        }
    }, concurrent);

    for (const botLogin of botLogins) {
        if (queue.started) {
            await queue.unsaturated();
        }
        queue.push(botLogin);
    }

    await queue.drain();
}

export enum OrganizationType {
    INDIVIDUAL = 'IND',
    UNKNOWN = 'N/A',
    COMPANY = 'COM',
    FOUNDATION = 'FDN',
    EDUCATION = 'EDU',
}

export interface Organization {
    name: string;
    full_name: string;
    type: OrganizationType;
    description: string;
    patterns: string[];
    domains: string[];
}

export async function loadOrgsToDatabase(logger: Consola, pool: Pool, concurrent: number, organizations: Organization[]) {
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
            logger.success(`Added organization named ${orgName} (id = ${orgId}).`);

            // Import org domains.
            if (Array.isArray(org.domains)) {
                loadOrgDomainsToDatabase(logger, pool, orgId, orgName, org.domains);
            }

            // Import org name patterns.
            if (Array.isArray(org.patterns)) {
                loadOrgPatternsToDatabase(logger, pool, orgId, orgName, org.patterns);
            }
        } catch(err) {
            logger.error('Failed to add or update organization:', org, err);
        }
    }, concurrent);

    for (const org of organizations) {
        if (queue.started) {
            await queue.unsaturated();
        }
        queue.push(org);
    }

    await queue.drain();
}

async function loadOrgDomainsToDatabase(logger: Consola, pool: Pool, orgId: number, orgName: string, domains: string[]) {
    try {
        const values = [];
        for (const domain of domains) {
            values.push([orgId, domain]);
        }
        const [rs] = await pool.query<ResultSetHeader>(`
            INSERT INTO organization_domains(org_id, name)
            VALUES ? 
            ON DUPLICATE KEY UPDATE org_id = VALUES(org_id), name = VALUES(name)
        `, [values]);
        logger.success(`Added ${rs.affectedRows} domains for organization ${orgName}.`);
    } catch (err) {
        logger.error(`Failed to add domains for organization ${orgName}: `, err);
    }
}

async function loadOrgPatternsToDatabase(logger: Consola, pool: Pool, orgId: number, orgName: string, patterns: string[]) {
    try {
        const values = [];
        for (const pattern of patterns) {
            values.push([orgId, pattern]);
        }
        const [rs] = await pool.query<ResultSetHeader>(`
            INSERT INTO organization_name_patterns(org_id, pattern)
            VALUES ? 
            ON DUPLICATE KEY UPDATE org_id = VALUES(org_id), pattern = VALUES(pattern)
        `, [values]);
        logger.success(`Added ${rs.affectedRows} name patterns for organization ${orgName}.`);
    } catch (err) {
        logger.error(`Failed to add patterns for organization ${orgName}: `, err);
    }
}

export async function formatOrgNamesInBatch(logger: Consola, pool: Pool) {
    
}

async function getOrgRegexpPatterns(params:string) {
    
}