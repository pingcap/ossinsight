/**
 * GHArchive ETL Tasks
 *
 * Implemented with Drizzle ORM for type-safe database access
 */
import type { Orbital } from '@mini256/orbital';
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
    private upsert;
    constructor(filename: string, options?: {
        upsert?: boolean;
    });
    run(): Promise<void>;
    private updateLog;
    private download;
    private parse;
    private extractFields;
    private flushEvents;
    private import;
}
export declare function registerGharchiveTasks(scheduler: Orbital): void;
//# sourceMappingURL=gharchive.d.ts.map