## 竞品分析

Libraries.io 和 Google Open Source Insights 的核心功能是**依赖关系分析**，OSSInsight 目前缺少此功能。

### 用户场景

1. **安全审计**: 我的项目依赖了哪些有安全漏洞的库？
2. **影响分析**: 某个底层库更新会影响哪些上游项目？
3. **生态洞察**: 某个技术栈的依赖关系图谱
4. **维护者视角**: 有多少项目依赖我的库？

## 建议功能

### 1. 依赖关系图谱 (Dependency Graph)

- 基于 GitHub package.json, Cargo.toml, go.mod 等文件解析依赖
- 可视化展示直接依赖和传递依赖
- 支持钻取：点击依赖项查看其详情

### 2. 反向依赖追踪 (Reverse Dependencies)

- 显示有多少项目依赖当前 repo
- 按影响力排序（依赖者的 star 数、下载量）
- 变更影响预警：你更新可能影响的项目列表

### 3. 依赖健康度分析

- 依赖项的更新频率
- 依赖项的健康度评分（联动 #2015）
- 过期依赖预警
- 安全漏洞关联（集成 GitHub Advisory Database）

### 4. 生态位分析

- 在依赖图谱中的位置（核心库 vs 边缘库）
- 同类替代品对比
- 技术栈演变趋势

## 差异化价值

| 功能 | Libraries.io | OSSInsight (建议) |
|------|-------------|------------------|
| 依赖图谱 | ✅ | ✅ |
| 反向依赖 | ✅ | ✅ + 影响力排序 |
| 健康度评分 | ❌ | ✅ (联动 #2015) |
| 趋势分析 | 基础 | ✅ AI 驱动深度分析 |
| 数据覆盖 | 多包管理器 | GitHub 全量事件 |

## 实施建议

### Phase 1 (MVP - 4 周)
- [ ] ETL: 解析 repo 根目录的包管理文件
- [ ] 存储依赖关系到 ClickHouse/TiDB
- [ ] 基础依赖列表页面

### Phase 2 (6 周)
- [ ] 反向依赖查询
- [ ] 依赖关系可视化图谱
- [ ] 依赖健康度指标

### Phase 3 (8 周)
- [ ] 安全漏洞集成
- [ ] 变更影响分析
- [ ] API 开放

## 技术挑战

1. **数据量**: 需要解析百万 + repo 的包管理文件
2. **更新频率**: 依赖关系变化频繁，需要增量更新
3. **多语言支持**: npm, pip, cargo, go, maven 等

## 预期影响

- 📈 **用户获取**: 依赖分析是开发者高频需求
- 🔄 **用户留存**: 项目维护者定期检查依赖健康度
- 💰 **商业化**: 企业版可提供私有依赖扫描

## 参考

- [Libraries.io](https://libraries.io/)
- [Google Open Source Insights](https://deps.dev/)
- [GitHub Dependency Graph](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph)
