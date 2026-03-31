# OSSInsight MCP API

A REST API endpoint designed for AI agents and MCP (Model Context Protocol) clients to access OSSInsight data programmatically.

**Base URL:** `https://ossinsight.io/api/mcp`

All endpoints use `GET` with query parameters. Responses follow a consistent schema:

```json
// Success
{ "ok": true, "data": ... }

// Error
{ "ok": false, "error": "Error message" }
```

CORS is enabled for cross-origin access.

---

## Endpoints

### List Collections

```
GET /api/mcp?action=collections
```

Returns all curated repository collections with IDs, names, slugs, and visit counts.

### Collection Ranking

```
GET /api/mcp?action=ranking&collectionId=10009&metric=stars&range=last-28-days
```

| Parameter      | Required | Values                                   | Default       |
| -------------- | -------- | ---------------------------------------- | ------------- |
| `collectionId` | Yes      | Collection ID (integer)                  | —             |
| `metric`       | No       | `stars`, `pull-requests`, `issues`       | `stars`       |
| `range`        | No       | `last-28-days`, `month`                  | `last-28-days`|

### Repository Analytics

```
GET /api/mcp?action=repo&owner=facebook&repo=react
```

Returns repository details: stars, forks, language, license, description.

### Trending Repos

```
GET /api/mcp?action=trending&language=All&period=past_week
```

| Parameter  | Required | Values                                                    | Default     |
| ---------- | -------- | --------------------------------------------------------- | ----------- |
| `language` | No       | `All`, `Python`, `JavaScript`, `TypeScript`, `Rust`, etc. | `All`       |
| `period`   | No       | `past_24_hours`, `past_week`, `past_month`, `past_3_months` | `past_week` |

### Search

```
GET /api/mcp?action=search&q=langchain
```

Returns matching repositories and collections.

### Compare Repos

```
GET /api/mcp?action=compare&repo1=langchain-ai/langchain&repo2=run-llama/llama_index
```

Returns side-by-side details for two repositories.

---

## Example Usage (curl)

```bash
# List all collections
curl "https://ossinsight.io/api/mcp?action=collections"

# Get AI Agent Frameworks ranking
curl "https://ossinsight.io/api/mcp?action=ranking&collectionId=10009&metric=stars&range=last-28-days"

# Search for "vector database"
curl "https://ossinsight.io/api/mcp?action=search&q=vector%20database"

# Get trending AI repos
curl "https://ossinsight.io/api/mcp?action=trending&language=Python&period=past_month"

# Compare two repos
curl "https://ossinsight.io/api/mcp?action=compare&repo1=facebook/react&repo2=vuejs/vue"
```
