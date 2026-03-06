import type { EndpointConfig } from '../config';

export interface LoadedEndpoint {
  config: EndpointConfig;
  sql: string;
}

const loaders: Record<string, () => Promise<LoadedEndpoint>> = {
  "analyze-commits-time-distribution": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-commits-time-distribution/template.sql"),
      import("../../../../configs/queries/analyze-commits-time-distribution/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-event-trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-event-trends/template.sql"),
      import("../../../../configs/queries/analyze-event-trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-issue-creators-company": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-issue-creators-company/template.sql"),
      import("../../../../configs/queries/analyze-issue-creators-company/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-issue-creators-map": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-issue-creators-map/template.sql"),
      import("../../../../configs/queries/analyze-issue-creators-map/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-issue-open-to-closed": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-issue-open-to-closed/template.sql"),
      import("../../../../configs/queries/analyze-issue-open-to-closed/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-issue-open-to-first-responded": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-issue-open-to-first-responded/template.sql"),
      import("../../../../configs/queries/analyze-issue-open-to-first-responded/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-issue-opened-and-closed": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-issue-opened-and-closed/template.sql"),
      import("../../../../configs/queries/analyze-issue-opened-and-closed/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-loc-per-month": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-loc-per-month/template.sql"),
      import("../../../../configs/queries/analyze-loc-per-month/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-activities-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-activities-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-activities-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-code-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-code-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-code-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-code-pr-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-code-pr-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-code-pr-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-code-review-comments-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-code-review-comments-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-code-review-comments-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-code-review-prs-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-code-review-prs-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-code-review-prs-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-code-review-submits-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-code-review-submits-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-code-review-submits-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-issue-close-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-issue-close-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-issue-close-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-issue-comment-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-issue-comment-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-issue-comment-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-people-issue-contribution-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-people-issue-contribution-rank/template.sql"),
      import("../../../../configs/queries/analyze-people-issue-contribution-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-pull-request-creators-company": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-pull-request-creators-company/template.sql"),
      import("../../../../configs/queries/analyze-pull-request-creators-company/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-pull-request-creators-map": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-pull-request-creators-map/template.sql"),
      import("../../../../configs/queries/analyze-pull-request-creators-map/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-pull-request-open-to-merged": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-pull-request-open-to-merged/template.sql"),
      import("../../../../configs/queries/analyze-pull-request-open-to-merged/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-pull-requests-size-per-month": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-pull-requests-size-per-month/template.sql"),
      import("../../../../configs/queries/analyze-pull-requests-size-per-month/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-pushes-and-commits-per-month": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-pushes-and-commits-per-month/template.sql"),
      import("../../../../configs/queries/analyze-pushes-and-commits-per-month/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-collaborative-productivity-metrics": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-collaborative-productivity-metrics/template.sql"),
      import("../../../../configs/queries/analyze-recent-collaborative-productivity-metrics/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-commits": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-commits/template.sql"),
      import("../../../../configs/queries/analyze-recent-commits/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-contributors": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-contributors/template.sql"),
      import("../../../../configs/queries/analyze-recent-contributors/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-issues": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-issues/template.sql"),
      import("../../../../configs/queries/analyze-recent-issues/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-pull-requests": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-pull-requests/template.sql"),
      import("../../../../configs/queries/analyze-recent-pull-requests/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-stars": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-stars/template.sql"),
      import("../../../../configs/queries/analyze-recent-stars/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-recent-top-contributors": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-recent-top-contributors/template.sql"),
      import("../../../../configs/queries/analyze-recent-top-contributors/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-repo-issue-overview": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-repo-issue-overview/template.sql"),
      import("../../../../configs/queries/analyze-repo-issue-overview/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-repo-milestones": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-repo-milestones/template.sql"),
      import("../../../../configs/queries/analyze-repo-milestones/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-repo-overview": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-repo-overview/template.sql"),
      import("../../../../configs/queries/analyze-repo-overview/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-repo-pr-overview": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-repo-pr-overview/template.sql"),
      import("../../../../configs/queries/analyze-repo-pr-overview/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-repo-top-contributors": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-repo-top-contributors/template.sql"),
      import("../../../../configs/queries/analyze-repo-top-contributors/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-stars-company": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-stars-company/template.sql"),
      import("../../../../configs/queries/analyze-stars-company/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-stars-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-stars-history/template.sql"),
      import("../../../../configs/queries/analyze-stars-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "analyze-stars-map": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/analyze-stars-map/template.sql"),
      import("../../../../configs/queries/analyze-stars-map/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/company-ranking-by-contributions": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/company-ranking-by-contributions/template.sql"),
      import("../../../../configs/queries/archive/2021/company-ranking-by-contributions/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/company-ranking-by-contributors": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/company-ranking-by-contributors/template.sql"),
      import("../../../../configs/queries/archive/2021/company-ranking-by-contributors/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/country-ranking-by-contributions": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/country-ranking-by-contributions/template.sql"),
      import("../../../../configs/queries/archive/2021/country-ranking-by-contributions/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/country-ranking-by-contributors": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/country-ranking-by-contributors/template.sql"),
      import("../../../../configs/queries/archive/2021/country-ranking-by-contributors/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/language-ranking-by-prs": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/language-ranking-by-prs/template.sql"),
      import("../../../../configs/queries/archive/2021/language-ranking-by-prs/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-contributor-ranking-by-prs": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-contributor-ranking-by-prs/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-contributor-ranking-by-prs/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-pr-creator-ranking-by-prs": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-pr-creator-ranking-by-prs/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-pr-creator-ranking-by-prs/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-racing-by-stars": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-racing-by-stars/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-racing-by-stars/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-issue-creators": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-creators/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-creators/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-issue-open-to-close": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-open-to-close/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-open-to-close/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-issue-open-to-first-respond": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-open-to-first-respond/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issue-open-to-first-respond/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-issues": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issues/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-issues/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-pr-open-to-merge": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-pr-open-to-merge/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-pr-open-to-merge/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-prs": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-prs/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-prs/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-stars-growth": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-stars-growth/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-stars-growth/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-yoy-stars-growth": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-yoy-stars-growth/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-yoy-stars-growth/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-yoy-stars-growth-least": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-yoy-stars-growth-least/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-yoy-stars-growth-least/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/2021/repo-ranking-by-z-score": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/2021/repo-ranking-by-z-score/template.sql"),
      import("../../../../configs/queries/archive/2021/repo-ranking-by-z-score/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/bot/contribution-ranking": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/bot/contribution-ranking/template.sql"),
      import("../../../../configs/queries/archive/bot/contribution-ranking/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/bot/cumulative-numbers": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/bot/cumulative-numbers/template.sql"),
      import("../../../../configs/queries/archive/bot/cumulative-numbers/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/bot/dependabot-commits-time-distribution": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/bot/dependabot-commits-time-distribution/template.sql"),
      import("../../../../configs/queries/archive/bot/dependabot-commits-time-distribution/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "archive/bot/weird-bots-ranking": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/archive/bot/weird-bots-ranking/template.sql"),
      import("../../../../configs/queries/archive/bot/weird-bots-ranking/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-issues-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-issues-history/template.sql"),
      import("../../../../configs/queries/collection-issues-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-issues-history-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-issues-history-rank/template.sql"),
      import("../../../../configs/queries/collection-issues-history-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-issues-last-28-days-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-issues-last-28-days-rank/template.sql"),
      import("../../../../configs/queries/collection-issues-last-28-days-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-issues-month-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-issues-month-rank/template.sql"),
      import("../../../../configs/queries/collection-issues-month-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-request-creators-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-request-creators-history/template.sql"),
      import("../../../../configs/queries/collection-pull-request-creators-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-request-creators-history-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-request-creators-history-rank/template.sql"),
      import("../../../../configs/queries/collection-pull-request-creators-history-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-requests-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-requests-history/template.sql"),
      import("../../../../configs/queries/collection-pull-requests-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-requests-history-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-requests-history-rank/template.sql"),
      import("../../../../configs/queries/collection-pull-requests-history-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-requests-last-28-days-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-requests-last-28-days-rank/template.sql"),
      import("../../../../configs/queries/collection-pull-requests-last-28-days-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-pull-requests-month-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-pull-requests-month-rank/template.sql"),
      import("../../../../configs/queries/collection-pull-requests-month-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-stars-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-stars-history/template.sql"),
      import("../../../../configs/queries/collection-stars-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-stars-history-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-stars-history-rank/template.sql"),
      import("../../../../configs/queries/collection-stars-history-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-stars-last-28-days-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-stars-last-28-days-rank/template.sql"),
      import("../../../../configs/queries/collection-stars-last-28-days-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "collection-stars-month-rank": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/collection-stars-month-rank/template.sql"),
      import("../../../../configs/queries/collection-stars-month-rank/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "events-increment": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/events-increment/template.sql"),
      import("../../../../configs/queries/events-increment/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "events-increment-intervals": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/events-increment-intervals/template.sql"),
      import("../../../../configs/queries/events-increment-intervals/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "events-increment-list": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/events-increment-list/template.sql"),
      import("../../../../configs/queries/events-increment-list/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "events-total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/events-total/template.sql"),
      import("../../../../configs/queries/events-total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "get-repo-by-id": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/get-repo-by-id/template.sql"),
      import("../../../../configs/queries/get-repo-by-id/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "get-repo-collections": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/get-repo-collections/template.sql"),
      import("../../../../configs/queries/get-repo-collections/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "get-user-by-login": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/get-user-by-login/template.sql"),
      import("../../../../configs/queries/get-user-by-login/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "live-time-base-information-hourly": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/live-time-base-information-hourly/template.sql"),
      import("../../../../configs/queries/live-time-base-information-hourly/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "live-time-top-developers-by-prs-daily": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/live-time-top-developers-by-prs-daily/template.sql"),
      import("../../../../configs/queries/live-time-top-developers-by-prs-daily/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "live-time-top-repos-by-prs-daily": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/live-time-top-repos-by-prs-daily/template.sql"),
      import("../../../../configs/queries/live-time-top-repos-by-prs-daily/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "organizations/check-if-is-merged-pr-creator": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/organizations/check-if-is-merged-pr-creator/template.sql"),
      import("../../../../configs/queries/organizations/check-if-is-merged-pr-creator/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "organizations/list-merged-pr-creators": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/organizations/list-merged-pr-creators/template.sql"),
      import("../../../../configs/queries/organizations/list-merged-pr-creators/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/commits/code-changes/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/commits/code-changes/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/commits/code-changes/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/commits/time-distribution": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/commits/time-distribution/template.sql"),
      import("../../../../configs/queries/orgs/commits/time-distribution/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/commits/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/commits/total/template.sql"),
      import("../../../../configs/queries/orgs/commits/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/commits/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/commits/trends/template.sql"),
      import("../../../../configs/queries/orgs/commits/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/actions/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/actions/trends/template.sql"),
      import("../../../../configs/queries/orgs/issues/actions/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/closed-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/closed-ratio/template.sql"),
      import("../../../../configs/queries/orgs/issues/closed-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/issue-comments/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/issue-comments/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/issues/issue-comments/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/open-to-close-duration/medium": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/open-to-close-duration/medium/template.sql"),
      import("../../../../configs/queries/orgs/issues/open-to-close-duration/medium/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/open-to-close-duration/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/open-to-close-duration/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/issues/open-to-close-duration/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/open-to-first-response-duration/medium": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/open-to-first-response-duration/medium/template.sql"),
      import("../../../../configs/queries/orgs/issues/open-to-first-response-duration/medium/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/open-to-first-response-duration/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/open-to-first-response-duration/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/issues/open-to-first-response-duration/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/total/template.sql"),
      import("../../../../configs/queries/orgs/issues/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/issues/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/issues/trends/template.sql"),
      import("../../../../configs/queries/orgs/issues/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/overview": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/overview/template.sql"),
      import("../../../../configs/queries/orgs/overview/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/active/ranking": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/active/ranking/template.sql"),
      import("../../../../configs/queries/orgs/participants/active/ranking/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/active/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/active/total/template.sql"),
      import("../../../../configs/queries/orgs/participants/active/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/active/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/active/trends/template.sql"),
      import("../../../../configs/queries/orgs/participants/active/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/engagements": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/engagements/template.sql"),
      import("../../../../configs/queries/orgs/participants/engagements/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/locations": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/locations/template.sql"),
      import("../../../../configs/queries/orgs/participants/locations/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/locations/completion-rate": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/locations/completion-rate/template.sql"),
      import("../../../../configs/queries/orgs/participants/locations/completion-rate/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/locations/filled-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/locations/filled-ratio/template.sql"),
      import("../../../../configs/queries/orgs/participants/locations/filled-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/new/ranking": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/new/ranking/template.sql"),
      import("../../../../configs/queries/orgs/participants/new/ranking/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/new/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/new/total/template.sql"),
      import("../../../../configs/queries/orgs/participants/new/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/new/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/new/trends/template.sql"),
      import("../../../../configs/queries/orgs/participants/new/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/organizations": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/organizations/template.sql"),
      import("../../../../configs/queries/orgs/participants/organizations/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/organizations/completion-rate": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/organizations/completion-rate/template.sql"),
      import("../../../../configs/queries/orgs/participants/organizations/completion-rate/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/organizations/filled-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/organizations/filled-ratio/template.sql"),
      import("../../../../configs/queries/orgs/participants/organizations/filled-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/roles": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/roles/template.sql"),
      import("../../../../configs/queries/orgs/participants/roles/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/participants/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/participants/trends/template.sql"),
      import("../../../../configs/queries/orgs/participants/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/actions/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/actions/trends/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/actions/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/merged-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/merged-ratio/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/merged-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/open-to-close-duration/medium": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/open-to-close-duration/medium/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/open-to-close-duration/medium/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/open-to-close-duration/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/open-to-close-duration/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/open-to-close-duration/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/open-to-first-response-duration/medium": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/open-to-first-response-duration/medium/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/open-to-first-response-duration/medium/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/open-to-first-response-duration/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/open-to-first-response-duration/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/open-to-first-response-duration/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/self-merged-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/self-merged-ratio/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/self-merged-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/total/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/pull-requests/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/pull-requests/trends/template.sql"),
      import("../../../../configs/queries/orgs/pull-requests/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/repos/template.sql"),
      import("../../../../configs/queries/orgs/repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/repos/active/ranking": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/repos/active/ranking/template.sql"),
      import("../../../../configs/queries/orgs/repos/active/ranking/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/repos/active/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/repos/active/total/template.sql"),
      import("../../../../configs/queries/orgs/repos/active/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/open-to-first-review-duration/medium": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/open-to-first-review-duration/medium/template.sql"),
      import("../../../../configs/queries/orgs/reviews/open-to-first-review-duration/medium/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/open-to-first-review-duration/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/open-to-first-review-duration/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/reviews/open-to-first-review-duration/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/review-comments/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/review-comments/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/reviews/review-comments/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/review-prs/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/review-prs/trends/template.sql"),
      import("../../../../configs/queries/orgs/reviews/review-prs/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/reviewed-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/reviewed-ratio/template.sql"),
      import("../../../../configs/queries/orgs/reviews/reviewed-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/total/template.sql"),
      import("../../../../configs/queries/orgs/reviews/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/reviews/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/reviews/trends/template.sql"),
      import("../../../../configs/queries/orgs/reviews/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/locations": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/locations/template.sql"),
      import("../../../../configs/queries/orgs/stars/locations/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/locations/completion-rate": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/locations/completion-rate/template.sql"),
      import("../../../../configs/queries/orgs/stars/locations/completion-rate/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/locations/filled-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/locations/filled-ratio/template.sql"),
      import("../../../../configs/queries/orgs/stars/locations/filled-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/organizations": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/organizations/template.sql"),
      import("../../../../configs/queries/orgs/stars/organizations/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/organizations/completion-rate": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/organizations/completion-rate/template.sql"),
      import("../../../../configs/queries/orgs/stars/organizations/completion-rate/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/organizations/filled-ratio": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/organizations/filled-ratio/template.sql"),
      import("../../../../configs/queries/orgs/stars/organizations/filled-ratio/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/top-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/top-repos/template.sql"),
      import("../../../../configs/queries/orgs/stars/top-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/total": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/total/template.sql"),
      import("../../../../configs/queries/orgs/stars/total/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "orgs/stars/trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/orgs/stars/trends/template.sql"),
      import("../../../../configs/queries/orgs/stars/trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-contribution-in-diff-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-contribution-in-diff-repos/template.sql"),
      import("../../../../configs/queries/personal-contribution-in-diff-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-contribution-time-distribution": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-contribution-time-distribution/template.sql"),
      import("../../../../configs/queries/personal-contribution-time-distribution/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-contribution-trends": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-contribution-trends/template.sql"),
      import("../../../../configs/queries/personal-contribution-trends/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-contributions-for-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-contributions-for-repos/template.sql"),
      import("../../../../configs/queries/personal-contributions-for-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-issues-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-issues-history/template.sql"),
      import("../../../../configs/queries/personal-issues-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-languages": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-languages/template.sql"),
      import("../../../../configs/queries/personal-languages/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-overview": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-overview/template.sql"),
      import("../../../../configs/queries/personal-overview/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-pull-request-action-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-pull-request-action-history/template.sql"),
      import("../../../../configs/queries/personal-pull-request-action-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-pull-request-code-changes-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-pull-request-code-changes-history/template.sql"),
      import("../../../../configs/queries/personal-pull-request-code-changes-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-pull-request-reviews-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-pull-request-reviews-history/template.sql"),
      import("../../../../configs/queries/personal-pull-request-reviews-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-pull-request-size-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-pull-request-size-history/template.sql"),
      import("../../../../configs/queries/personal-pull-request-size-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-pushes-and-commits": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-pushes-and-commits/template.sql"),
      import("../../../../configs/queries/personal-pushes-and-commits/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "personal-star-history": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/personal-star-history/template.sql"),
      import("../../../../configs/queries/personal-star-history/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "recent-hot-collections": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/recent-hot-collections/template.sql"),
      import("../../../../configs/queries/recent-hot-collections/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/repos/template.sql"),
      import("../../../../configs/queries/repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-index-info": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-index-info/template.sql"),
      import("../../../../configs/queries/stats-index-info/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-index-usage": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-index-usage/template.sql"),
      import("../../../../configs/queries/stats-index-usage/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-indexes-info": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-indexes-info/template.sql"),
      import("../../../../configs/queries/stats-indexes-info/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-indexes-usage": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-indexes-usage/template.sql"),
      import("../../../../configs/queries/stats-indexes-usage/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-query-records": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-query-records/template.sql"),
      import("../../../../configs/queries/stats-query-records/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-query-records-latest": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-query-records-latest/template.sql"),
      import("../../../../configs/queries/stats-query-records-latest/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-table-ddl": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-table-ddl/template.sql"),
      import("../../../../configs/queries/stats-table-ddl/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "stats-table-info": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/stats-table-info/template.sql"),
      import("../../../../configs/queries/stats-table-info/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
  "trending-repos": async () => {
    const [sqlModule, configModule] = await Promise.all([
      import("../../../../configs/queries/trending-repos/template.sql"),
      import("../../../../configs/queries/trending-repos/params.json"),
    ]);
    return {
      sql: String(sqlModule.default),
      config: configModule.default as EndpointConfig,
    };
  },
};

export function hasEndpoint(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(loaders, name);
}

export default async function loadEndpoint(name: string): Promise<LoadedEndpoint> {
  const loader = loaders[name];
  if (!loader) {
    throw new Error(`Endpoint not found: ${name}`);
  }
  return loader();
}
