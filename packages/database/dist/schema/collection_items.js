/**
 * collection_items schema
 */
import { mysqlTable, varchar, index, } from 'drizzle-orm/mysql-core';
export const collectionItems = mysqlTable('collection_items', {
    id: varchar('id', { length: 20 }).primaryKey(),
    collection_id: varchar('collectionId', { length: 20 }),
    repo_name: varchar('repoName', { length: 255 }),
    repo_id: varchar('repoId', { length: 20 }),
    last_month_rank: varchar('lastMonthRank', { length: 11 }),
    last_2ndMonthRank: varchar('last_2ndMonthRank', { length: 11 }),
}, (table) => ({
    index_collection_items_on_collection_id: index('index_collection_items_on_collection_id').on(table.collection_id),
}));
//# sourceMappingURL=collection_items.js.map