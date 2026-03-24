/**
 * repo_milestone_types schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const repoMilestoneTypes = mysqlTable('repo_milestone_types', {
    id: varchar('id', { length: 11 }).primaryKey(),
    name: varchar('name', { length: 30 }),
}, (table) => ({}));
//# sourceMappingURL=repo_milestone_types.js.map