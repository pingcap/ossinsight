/**
 * explorer_recommend_questions schema
 */
import { mysqlTable, varchar, boolean, } from 'drizzle-orm/mysql-core';
export const explorerRecommendQuestions = mysqlTable('explorer_recommend_questions', {
    hash: varchar('hash', { length: 128 }).primaryKey(),
    title: varchar('title', { length: 255 }),
    ai_generated: boolean('aiGenerated'),
}, (table) => ({}));
//# sourceMappingURL=explorer_recommend_questions.js.map