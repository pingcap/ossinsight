# Affiliation Data Cleanup

自动清理 GitHub 用户从属关系数据的定时任务。

## 数据流

```
github_users (organization_formatted)
    ↓
affiliation_names (别名映射)
    ↓
affiliations (标准公司/组织名录)
    ↓
github_user_affiliations (用户 - 公司关联表)
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `cleanup_affiliations.py` | 主清理脚本（每 10 分钟运行） |
| `check_progress.py` | 查看进度 |
| `cleanup_state.json` | 进度状态文件 |
| `cleanup.log` | 运行日志 |
| `cron.log` | Cron 日志 |

## 使用

```bash
# 查看进度
python3 check_progress.py

# 手动运行一次清理
python3 cleanup_affiliations.py

# 查看日志
tail -f cleanup.log

# 查看 cron 状态
crontab -l
```

## 进度估算

- 总组织数：~2,097,015
- 每批次：500 个组织
- 运行间隔：10 分钟
- 预计完成：约 29 天

## 清理策略

1. **匹配已知公司** - 使用预定义的别名映射表
2. **归一化处理** - 去除后缀、统一格式
3. **忽略无效值** - 国家名、"Independent"、"Student"等

## 状态文件示例

```json
{
  "last_offset": 500,
  "processed_orgs": 500,
  "total_orgs": 2097015,
  "last_run": "2026-03-23T16:50:24",
  "completed": false
}
```
