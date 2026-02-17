/** Admin user info */
export interface AdminUser {
  id: number;
  email: string;
  role: 'admin' | 'viewer';
  created_at: Date;
}

/** Dashboard stats */
export interface DashboardStats {
  totalEvents: number;
  totalRepos: number;
  totalCollections: number;
  activeTasks: number;
  taskSuccessRate: number;
  cacheHitRate: number;
  recentErrors: number;
  apiRequestsToday: number;
}

/** System status */
export interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
  scheduler: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
}
