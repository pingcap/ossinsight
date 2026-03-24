/**
 * ETL (Extract, Transform, Load) Tasks
 *
 * Handles data processing workflows
 */
import type { Orbital } from '@mini256/orbital';
export interface EtlProcessData {
    pipelineId: string;
    source: string;
    destination: string;
    options?: Record<string, unknown>;
}
export interface EtlTransformData {
    transformId: string;
    input: string;
    output: string;
    transformType: 'map' | 'filter' | 'aggregate' | 'join';
}
export interface EtlLoadData {
    loadId: string;
    data: unknown[];
    target: string;
    mode: 'insert' | 'upsert' | 'replace';
}
export declare function registerEtlTasks(scheduler: Orbital): void;
//# sourceMappingURL=etl.d.ts.map