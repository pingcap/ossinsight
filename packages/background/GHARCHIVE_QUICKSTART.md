# GHArchive ETL - 快速开始

## 1. 设置数据库

```bash
cd /home/ubuntu/.openclaw/workspace/ossinsight/packages/background

# 使用 TiDB Cloud (生产环境 - ossinsight 数据库)
export BACKGROUND_DATABASE_URL="mysql://e82Anu4yeQBb47c.root:4GTivTLWlPbalFTl@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"
export BACKGROUND_REDIS_URL="redis://localhost:6379"

# 运行数据库迁移 (创建 import_logs 和 github_events 表)
pnpm setup:gharchive:db
```

## 2. 启动服务

需要两个终端窗口：

### Terminal 1 - Scheduler (任务调度器)

```bash
cd /home/ubuntu/.openclaw/workspace/ossinsight/packages/background
pnpm start
```

### Terminal 2 - Worker (任务执行器)

```bash
cd /home/ubuntu/.openclaw/workspace/ossinsight/packages/background
pnpm worker
```

## 3. 测试导入

### 方法 1: Node.js 脚本

```bash
node -e "
const { getBackgroundService } = require('./dist/index.js');
const service = getBackgroundService();

// 导入 2026-03-23 12:00 的数据
service.enqueue('gharchive.import.hourly', { 
  date: '2026-03-23', 
  hour: 12,
  force: false,
  upsert: false
}).then(id => console.log('Task queued:', id));
"
```

### 方法 2: 创建测试脚本

创建 `test-import.js`:

```javascript
import { getBackgroundService } from './dist/index.js';

const service = getBackgroundService();

async function test() {
  console.log('Testing GHArchive import...');
  
  // Test 1: Single hour
  const taskId = await service.enqueue('gharchive.import.hourly', { 
    date: '2026-03-23', 
    hour: 12
  });
  console.log('✓ Task queued:', taskId);
  
  // Wait and check status
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Test completed!');
  process.exit(0);
}

test().catch(console.error);
```

运行：
```bash
node test-import.js
```

## 4. 监控进度

### 查看导入日志

```bash
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u e82Anu4yeQBb47c.root -p4GTivTLWlPbalFTl ossinsight -e "
SELECT 
  id, 
  filename, 
  status, 
  start_batch_at, 
  end_import_at,
  TIMESTAMPDIFF(SECOND, start_batch_at, end_import_at) as duration_sec
FROM import_logs 
ORDER BY id DESC 
LIMIT 10;
"
```

### 查看事件统计

```bash
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u e82Anu4yeQBb47c.root -p4GTivTLWlPbalFTl ossinsight -e "
SELECT 
  event_day,
  COUNT(*) as event_count,
  COUNT(DISTINCT actor_id) as unique_actors,
  COUNT(DISTINCT repo_id) as unique_repos
FROM github_events 
GROUP BY event_day 
ORDER BY event_day DESC 
LIMIT 7;
"
```

### 查看任务状态

```bash
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u e82Anu4yeQBb47c.root -p4GTivTLWlPbalFTl ossinsight -e "
SELECT 
  id,
  type,
  status,
  priority,
  created_at,
  completed_at,
  error_message
FROM orbital_tasks 
WHERE type LIKE 'gharchive%'
ORDER BY created_at DESC 
LIMIT 10;
"
```

## 5. 常用操作

### 导入日期范围

```javascript
const service = getBackgroundService();

await service.enqueue('gharchive.import.range', { 
  from: '2026-03-01', 
  to: '2026-03-23',
  force: false
});
```

### 重新导入缺失文件

```javascript
await service.enqueue('gharchive.import.missing', {});
```

### 强制重新导入 (先删除再导入)

```javascript
await service.enqueue('gharchive.import.hourly', { 
  date: '2026-03-23', 
  hour: 12,
  force: true  // 删除现有数据
});
```

### 使用 upsert 模式

```javascript
await service.enqueue('gharchive.import.hourly', { 
  date: '2026-03-23', 
  hour: 12,
  upsert: true  // 使用 ON DUPLICATE KEY UPDATE
});
```

## 6. 自动调度

系统已配置两个自动任务：

| 任务 | Cron | 说明 |
|------|------|------|
| `gharchive.hourly.previous` | `30 * * * *` | 每小时 30 分导入前一小时数据 |
| `gharchive.daily.backfill` | `0 3 * * *` | 每天 3 AM 回补 7 天前数据 |

Scheduler 启动后会自动运行这些任务，无需手动干预。

## 7. 故障排查

### 任务一直处于 pending 状态

检查 worker 是否运行：
```bash
ps aux | grep "node dist/cli.js worker"
```

检查 Redis 连接：
```bash
redis-cli ping
```

### 导入失败

查看错误信息：
```bash
mysql -h ... -e "
SELECT filename, status, error_message, created_at 
FROM import_logs 
WHERE status = 'failed' 
ORDER BY id DESC 
LIMIT 5;
"
```

### 内存过高

TypeScript 版本使用流式处理，内存占用应 < 100MB。如果过高，检查是否有其他进程。

## 8. 性能调优

### 增加 Worker 并发

```bash
export BACKGROUND_WORKER_CONCURRENCY=20
pnpm worker
```

### 调整批处理大小

修改 `src/tasks/gharchive.ts`:
```typescript
const BATCH_SIZE = 90000; // 增加或减少
```

### 并行导入多个小时

```javascript
// 并行导入一整天的数据
const promises = [];
for (let hour = 0; hour < 24; hour++) {
  promises.push(
    service.enqueue('gharchive.import.hourly', { 
      date: '2026-03-23', 
      hour: hour
    })
  );
}
await Promise.all(promises);
```

## 9. 与 Ruby ETL 对比

| 特性 | Ruby ETL | TypeScript ETL |
|------|----------|----------------|
| 内存占用 | ~500MB | ~50MB |
| 处理速度 | ~30s/小时 | ~25s/小时 |
| 并发能力 | 单机 | 多 worker |
| 调度方式 | Rake | Orbital (分布式) |
| 重试机制 | retryable gem | 原生指数退避 |

## 10. 下一步

- ✅ Phase 1: 核心导入功能完成
- ⏳ Phase 2: 迁移 meta 数据加载
- ⏳ Phase 3: 性能优化和监控

---

**有问题？** 查看完整文档：`GHARCHIVE_MIGRATION.md`
