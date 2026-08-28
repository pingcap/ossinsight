import {Prisma, PrismaClient} from '@prisma/client';
import * as fs from "fs";
import path from "path";
import {Logger} from "pino";

export const REPO_STAR_SNAPSHOTS_TABLE = 'sys_repo_star_snapshots';

export interface RepoStarSnapshot {
  repoId: number;
  // The UTC day the snapshot belongs to, formatted as `YYYY-MM-DD`.
  snapshotDay: string;
  stargazerCount: number;
  forksCount: number | null;
  retrievedAt: Date;
  source: string;
}

export class RepoStarSnapshotDao {

  constructor(readonly logger: Logger, readonly prisma: PrismaClient) {}

  /**
   * The table DDL lives in `configs/materialized_views/sys_repo_star_snapshots/ddl.sql`
   * (a `CREATE TABLE IF NOT EXISTS` statement), so the first run can bootstrap the
   * table by itself while the DDL stays single-sourced in the configs directory.
   */
  async ensureTable(configsPath: string): Promise<void> {
    const ddlPath = path.join(configsPath, 'materialized_views', REPO_STAR_SNAPSHOTS_TABLE, 'ddl.sql');
    const ddl = fs.readFileSync(ddlPath, 'utf-8');
    await this.prisma.$executeRawUnsafe(ddl);
    this.logger.debug(`Ensured table ${REPO_STAR_SNAPSHOTS_TABLE} exists.`);
  }

  // Idempotent by design: re-running the snapshot job on the same day only
  // refreshes the same (repo_id, snapshot_day) rows.
  async upsertSnapshots(snapshots: RepoStarSnapshot[]): Promise<number> {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return 0;
    }

    const affectedRows = await this.prisma.$executeRaw`
        INSERT INTO sys_repo_star_snapshots (repo_id, snapshot_day, stargazer_count, forks_count, retrieved_at, source)
        VALUES ${Prisma.join(snapshots.map(snapshot => Prisma.sql`(
        ${snapshot.repoId}, ${snapshot.snapshotDay}, ${snapshot.stargazerCount}, ${snapshot.forksCount},
        ${snapshot.retrievedAt}, ${snapshot.source}
      )`))}
        ON DUPLICATE KEY UPDATE stargazer_count = VALUES(stargazer_count),
                                forks_count     = VALUES(forks_count),
                                retrieved_at    = VALUES(retrieved_at),
                                source          = VALUES(source);
    `;

    if (affectedRows > 0) {
      this.logger.info(`💾 Bulk upsert ${snapshots.length} repo star snapshots.`);
    }

    return affectedRows;
  }

}
