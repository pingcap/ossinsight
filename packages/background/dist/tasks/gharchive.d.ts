/**
 * GHArchive ETL Tasks
 *
 * Migrates Ruby ETL (etl/lib/importer.rb, etl/lib/tasks/import.rake)
 * to TypeScript/Orbital for gharchive_dev data import.
 */
import type { Orbital } from '@mini256/orbital';
export interface GharchiveEventData {
    id: string;
    type: string;
    actor_id: number;
    actor_login: string;
    repo_id: number;
    repo_name: string;
    org_id: number;
    org_login: string;
    created_at: string;
    language: string;
    additions: number;
    deletions: number;
    action: string;
    number: number;
    commit_id: string;
    comment_id: number;
    state: string;
    closed_at: string;
    comments: number;
    pr_merged: boolean;
    pr_merged_at: string;
    pr_changed_files: number;
    pr_review_comments: number;
    pr_or_issue_id: number;
    push_size: number;
    push_distinct_size: number;
    creator_user_id: number;
    creator_user_login: string;
    pr_or_issue_created_at: string;
    event_day: string;
    event_month: string;
    event_year: number;
}
export interface ImportLogData {
    id?: number;
    filename: string;
    start_batch_at: string;
    start_download_at?: string;
    end_download_at?: string;
    start_import_at?: string;
    end_import_at?: string;
    status?: 'pending' | 'downloading' | 'parsing' | 'importing' | 'completed' | 'failed';
    error_message?: string;
}
export interface GharchiveImportData {
    date: string;
    hour: number;
    force?: boolean;
    upsert?: boolean;
}
export declare class GharchiveImporter {
    private filename;
    private url;
    private batchAt;
    private importLogId;
    private events;
    private cacheDir;
    private upsert;
    constructor(filename: string, options?: {
        cacheDir?: string;
        upsert?: boolean;
    });
    run(): Promise<void>;
    private updateLog;
    private download;
    private parse;
    private extractFields;
    private flushEvents;
    private insertAll;
    private upsertAll;
    private import;
}
export declare function registerGharchiveTasks(scheduler: Orbital): void;
//# sourceMappingURL=gharchive.d.ts.map