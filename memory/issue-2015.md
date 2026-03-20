## 竞品分析

通过对标 Libraries.io、Open Source Insights (Google)、RepoRater 等竞品，发现 OSSInsight 缺少**项目健康度评分**功能。

### 竞品现状

| 竞品 | 健康度指标 | 维护者分析 |
|------|-----------|-----------|
| Libraries.io | 依赖树健康度 | 维护者数量追踪 |
| Open Source Insights | 依赖图分析 | ❌ |
| RepoRater | 综合评分系统 | ❌ |
| **OSSInsight** | ❌ | ❌ |

## 建议功能

### 1. 项目健康度评分 (Project Health Score)

综合以下维度计算 0-100 分：

- **活跃度** (30%): 近 3 个月 commit 频率、issue/PR 处理速度
- **社区参与** (25%): 贡献者数量变化、PR review 响应时间
- **代码质量** (20%): PR 合并率、issue 关闭率、平均 PR 大小
- **增长趋势** (15%): Star 增长率、Fork 增长率
- **维护可持续性** (10%): 核心维护者数量、Bus Factor 评估

### 2. 维护者可持续性指标

- **Bus Factor**: 多少核心贡献者离开会导致项目停滞
- **贡献集中度**: Top 5 贡献者占比（过高表示风险）
- **响应 SLA**: issue/PR 平均响应时间、关闭时间
- **维护者 burnout 预警**: 单个维护者负载过高时提醒

### 3. 差异化价值

✅ **数据优势**: 基于 10 亿 + GitHub 事件数据，比竞品更准确
✅ **AI 驱动**: 可用 Chat2Query 自定义健康度公式
✅ **可视化**: 历史趋势图 + 同行对比

## 实施建议

### Phase 1 (MVP - 2 周)
- [ ] 定义健康度评分算法
- [ ] 在 Repo Analytics 页面增加 Health Score 展示
- [ ] 添加 Collection 健康度排行榜

### Phase 2 (4 周)
- [ ] 维护者可持续性分析
- [ ] Bus Factor 计算
- [ ] 健康度预警通知（配合 #2007 邮件订阅）

### Phase 3 (6 周)
- [ ] API 开放健康度数据
- [ ] Badge 支持
- [ ] 企业版：私有 repo 健康度监控

## 预期影响

- 📈 **用户获取**: 健康度 Badge 可嵌入 README，带来自然流量
- 🔄 **用户留存**: 项目维护者会定期查看健康度变化
- 🦠 **病毒传播**: 健康度评分易于在社交媒体传播讨论

## 技术实现

健康度评分可基于现有 GitHub Events 数据计算，无需额外数据源。

## 参考

- CHAOSS Metrics - 开源社区健康度标准
- Maintainer Survey - 维护者调研数据
