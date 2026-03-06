import {computeLayout} from '@/lib/widgets-utils/compose';

function makeVisualizer(importVisualizerModule, isJsx) {
  return () => importVisualizerModule().then(visualizer => {
    if (visualizer.type !== 'compose' || !isJsx) {
      return visualizer;
    }

    const originalRenderer = visualizer.default;

    function renderer(input, ctx) {
      const layout = originalRenderer(input, ctx);

      return computeLayout(layout, 0, 0, ctx.width, ctx.height);
    }

    return Object.freeze({
      ...visualizer,
      default: renderer
    });
  })
}

function createFetcher(importJson) {
  return async (ctx, signal) => {
    const [{default: json}, {default: core}] = await Promise.all([
      importJson(),
      import('@/lib/widgets-core/datasource')
    ]);
    return await core(json, ctx, signal);
  }
}

const _modules = [
  [
    "@ossinsight/widget-compose-user-dashboard-stats",
    {...{"name":"@ossinsight/widget-compose-user-dashboard-stats","version":"1.0.0","keywords":["Developer"],"description":"Analyze User Dashboard Stats","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/user/dashboard-stats/params.json"),
    () => import("./compose/user/dashboard-stats/datasource.json"),
    () => import("./compose/user/dashboard-stats/visualization.tsx"),
    () => import("./compose/user/dashboard-stats/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-recent-top-contributors",
    {...{"name":"@ossinsight/widget-compose-recent-top-contributors","version":"1.0.0","keywords":["🔥Popular","Repository","Contributor"],"description":"Identify the top contributors with their contribution counts in a repository over the last 28 days. ","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/recent-top-contributors/params.json"),
    () => import("./compose/recent-top-contributors/datasource.json"),
    () => import("./compose/recent-top-contributors/visualization.tsx"),
    () => import("./compose/recent-top-contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-recent-active-contributors",
    {...{"name":"@ossinsight/widget-compose-recent-active-contributors","version":"1.0.0","keywords":["🔥Popular","Repository","Contributor"],"description":"Identify the most active contributors in a repository over the past 28 days. Recognize and engage with individuals who have made significant contributions during this period.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/recent-active-contributors/params.json"),
    () => import("./compose/recent-active-contributors/datasource.json"),
    () => import("./compose/recent-active-contributors/visualization.tsx"),
    () => import("./compose/recent-active-contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-stars-top-repos",
    {...{"name":"@ossinsight/widget-compose-org-stars-top-repos","version":"1.0.0","keywords":["Organization"],"description":"Top repositories by stars for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/stars-top-repos/params.json"),
    () => import("./compose/org/stars-top-repos/datasource.json"),
    () => import("./compose/org/stars-top-repos/visualization.ts"),
    () => import("./compose/org/stars-top-repos/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-pull-requests-open-to-review",
    {...{"name":"@ossinsight/widget-compose-org-pull-requests-open-to-review","version":"1.0.0","keywords":["Organization"],"description":"Ranking of repos with most proactive Pull Request Review responses of an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/pull-requests-open-to-review/params.json"),
    () => import("./compose/org/pull-requests-open-to-review/datasource.json"),
    () => import("./compose/org/pull-requests-open-to-review/visualization.ts"),
    () => import("./compose/org/pull-requests-open-to-review/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-productivity-ratio",
    {...{"name":"@ossinsight/widget-compose-org-productivity-ratio","version":"1.0.0","keywords":["Organization"],"description":"Activity ratio of an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/productivity-ratio/params.json"),
    () => import("./compose/org/productivity-ratio/datasource.json"),
    () => import("./compose/org/productivity-ratio/visualization.ts"),
    () => import("./compose/org/productivity-ratio/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-participants-roles-ratio",
    {...{"name":"@ossinsight/widget-compose-org-participants-roles-ratio","version":"1.0.0","keywords":["Organization"],"description":"Participants roles ratio of an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/participants-roles-ratio/params.json"),
    () => import("./compose/org/participants-roles-ratio/datasource.json"),
    () => import("./compose/org/participants-roles-ratio/visualization.ts"),
    () => import("./compose/org/participants-roles-ratio/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-participants-growth",
    {...{"name":"@ossinsight/widget-compose-org-participants-growth","version":"1.0.0","keywords":["Organization"],"description":"Participants trends for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/participants-growth/params.json"),
    () => import("./compose/org/participants-growth/datasource.json"),
    () => import("./compose/org/participants-growth/visualization.ts"),
    () => import("./compose/org/participants-growth/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-overview-stats",
    {...{"name":"@ossinsight/widget-compose-org-overview-stats","version":"1.0.0","keywords":["Organization"],"description":"[Overview] Pull Requests/Issues/Reviews stats for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/overview-stats/params.json"),
    () => import("./compose/org/overview-stats/datasource.json"),
    () => import("./compose/org/overview-stats/visualization.ts"),
    () => import("./compose/org/overview-stats/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-overview-stars",
    {...{"name":"@ossinsight/widget-compose-org-overview-stars","version":"1.0.0","keywords":["Organization","Stars"],"description":"Overview of stars earned for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/overview-stars/params.json"),
    () => import("./compose/org/overview-stars/datasource.json"),
    () => import("./compose/org/overview-stars/visualization.ts"),
    () => import("./compose/org/overview-stars/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-engagement-scatter",
    {...{"name":"@ossinsight/widget-compose-org-engagement-scatter","version":"1.0.0","keywords":["Organization"],"description":"Most engaged people in an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/engagement-scatter/params.json"),
    () => import("./compose/org/engagement-scatter/datasource.json"),
    () => import("./compose/org/engagement-scatter/visualization.ts"),
    () => import("./compose/org/engagement-scatter/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-code-changes-top-repositories",
    {...{"name":"@ossinsight/widget-compose-org-code-changes-top-repositories","version":"1.0.0","keywords":["Organization"],"description":"Ranking of repos with the commit code changes in an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/code-changes-top-repositories/params.json"),
    () => import("./compose/org/code-changes-top-repositories/datasource.json"),
    () => import("./compose/org/code-changes-top-repositories/visualization.ts"),
    () => import("./compose/org/code-changes-top-repositories/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-open-to-first-response",
    {...{"name":"@ossinsight/widget-compose-org-activity-open-to-first-response","version":"1.0.0","keywords":["Organization"],"description":"Measure and compare first response times to issues/PRs. Identify bottlenecks and assess response efficiency.","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-open-to-first-response/params.json"),
    () => import("./compose/org/activity-open-to-first-response/datasource.json"),
    () => import("./compose/org/activity-open-to-first-response/visualization.ts"),
    () => import("./compose/org/activity-open-to-first-response/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-open-to-close",
    {...{"name":"@ossinsight/widget-compose-org-activity-open-to-close","version":"1.0.0","keywords":["Organization"],"description":"Measure and compare completion time to issues/prs. Identify bottlenecks and assess response efficiency.","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-open-to-close/params.json"),
    () => import("./compose/org/activity-open-to-close/datasource.json"),
    () => import("./compose/org/activity-open-to-close/visualization.ts"),
    () => import("./compose/org/activity-open-to-close/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-new-ranking",
    {...{"name":"@ossinsight/widget-compose-org-activity-new-ranking","version":"1.0.0","keywords":["Organization"],"description":"TODO","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-new-ranking/params.json"),
    () => import("./compose/org/activity-new-ranking/datasource.json"),
    () => import("./compose/org/activity-new-ranking/visualization.ts"),
    () => import("./compose/org/activity-new-ranking/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-map",
    {...{"name":"@ossinsight/widget-compose-org-activity-map","version":"1.0.0","keywords":["Organization"],"description":"Visualize and compare the geographic distribution of stars/participants worldwide.","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-map/params.json"),
    () => import("./compose/org/activity-map/datasource.json"),
    () => import("./compose/org/activity-map/visualization.ts"),
    () => import("./compose/org/activity-map/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-growth-total",
    {...{"name":"@ossinsight/widget-compose-org-activity-growth-total","version":"1.0.0","keywords":["Organization"],"description":"Activity trends for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-growth-total/params.json"),
    () => import("./compose/org/activity-growth-total/datasource.json"),
    () => import("./compose/org/activity-growth-total/visualization.ts"),
    () => import("./compose/org/activity-growth-total/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-company",
    {...{"name":"@ossinsight/widget-compose-org-activity-company","version":"1.0.0","keywords":["Organization","Company"],"description":"Analyze company affiliations of repository stargazers and participants.","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-company/params.json"),
    () => import("./compose/org/activity-company/datasource.json"),
    () => import("./compose/org/activity-company/visualization.ts"),
    () => import("./compose/org/activity-company/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-activity-active-ranking",
    {...{"name":"@ossinsight/widget-compose-org-activity-active-ranking","version":"1.0.0","keywords":["Organization"],"description":"TODO","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/activity-active-ranking/params.json"),
    () => import("./compose/org/activity-active-ranking/datasource.json"),
    () => import("./compose/org/activity-active-ranking/visualization.ts"),
    () => import("./compose/org/activity-active-ranking/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-org-active-contributors",
    {...{"name":"@ossinsight/widget-compose-org-active-contributors","version":"1.0.0","keywords":["Organization"],"description":"Show the active/new contributors of an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./compose/org/active-contributors/params.json"),
    () => import("./compose/org/active-contributors/datasource.json"),
    () => import("./compose/org/active-contributors/visualization.ts"),
    () => import("./compose/org/active-contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-last-28-days-stats",
    {...{"name":"@ossinsight/widget-compose-last-28-days-stats","version":"1.0.0","keywords":["🔥Popular","Repository"],"description":"Analyze the overall repository performance in the last 28 days with stars, active contributors, pull requests, and issues.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/last-28-days-stats/params.json"),
    () => import("./compose/last-28-days-stats/datasource.json"),
    () => import("./compose/last-28-days-stats/visualization.tsx"),
    () => import("./compose/last-28-days-stats/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-last-28-days-collaborative-productivity",
    {...{"name":"@ossinsight/widget-compose-last-28-days-collaborative-productivity","version":"1.0.0","keywords":["🔥Popular","Repository"],"description":"Analyze the collaborative efficiency of a repository, including pull request merge rate, review rate, and issue closed rate, over the last 28 days.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/last-28-days-collaborative-productivity/params.json"),
    () => import("./compose/last-28-days-collaborative-productivity/datasource.json"),
    () => import("./compose/last-28-days-collaborative-productivity/visualization.tsx"),
    () => import("./compose/last-28-days-collaborative-productivity/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-currently-working-on",
    {...{"name":"@ossinsight/widget-compose-currently-working-on","version":"1.0.0","keywords":["🔥Popular","Developer"],"description":"Analyze a developer's recent focus by identifying actively engaged repositories in the last 28 days.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/currently-working-on/params.json"),
    () => import("./compose/currently-working-on/datasource.json"),
    () => import("./compose/currently-working-on/visualization.tsx"),
    () => import("./compose/currently-working-on/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-contributors",
    {...{"name":"@ossinsight/widget-compose-contributors","version":"1.0.0","keywords":["🔥Popular","Repository","Contributor"],"description":"Show all the contributors of the repo.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/contributors/params.json"),
    () => import("./compose/contributors/datasource.json"),
    () => import("./compose/contributors/visualization.tsx"),
    () => import("./compose/contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-compose-activity-trends",
    {...{"name":"@ossinsight/widget-compose-activity-trends","version":"1.0.0","keywords":["🔥Popular","Reposiory"],"description":"Analyze all different types of events triggered by activity on GitHub within a repository over the last 28 days.","author":"OSSInsight"}, isJsx: true },
    () => import("./compose/activity-trends/params.json"),
    () => import("./compose/activity-trends/datasource.json"),
    () => import("./compose/activity-trends/visualization.tsx"),
    () => import("./compose/activity-trends/metadata.ts")
  ],
  [
    "@ossinsight/widget-collection-annually-ranking",
    {...{"name":"@ossinsight/widget-collection-annually-ranking","version":"1.0.0","keywords":["Collection","Ranking"],"description":"Rank a group of repositories within the same technical field based on star count, pull request count, pull request creators, and issue count.","author":"OSSInsight"}, isJsx: false },
    () => import("./collection-annually-ranking/params.json"),
    () => import("./collection-annually-ranking/datasource.json"),
    () => import("./collection-annually-ranking/visualization.ts"),
    () => import("./collection-annually-ranking/metadata.ts")
  ],
  [
    "@ossinsight/basic-radar-chart",
    {...{"name":"@ossinsight/basic-radar-chart","version":"1.0.0","private":true,"keywords":[],"description":"TODO","author":"OSSInsight"}, isJsx: false },
    () => import("./basic/radar-chart/params.json"),
    () => import("./basic/radar-chart/datasource.json"),
    () => import("./basic/radar-chart/visualization.ts"),
    () => import("./basic/radar-chart/metadata.ts")
  ],
  [
    "@ossinsight/basic-bubbles-chart",
    {...{"name":"@ossinsight/basic-bubbles-chart","version":"1.0.0","private":true,"keywords":[],"description":"TODO","author":"OSSInsight"}, isJsx: false },
    () => import("./basic/bubbles-chart/params.json"),
    () => import("./basic/bubbles-chart/datasource.json"),
    () => import("./basic/bubbles-chart/visualization.ts"),
    () => import("./basic/bubbles-chart/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-user-contribution-trends",
    {...{"name":"@ossinsight/widget-analyze-user-contribution-trends","version":"1.0.0","private":true,"keywords":["Developer"],"description":"Show the contribution trends of a GitHub user.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/user/contribution-trends/params.json"),
    () => import("./analyze/user/contribution-trends/datasource.json"),
    () => import("./analyze/user/contribution-trends/visualization.ts"),
    () => import("./analyze/user/contribution-trends/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-user-contribution-time-distribution",
    {...{"name":"@ossinsight/widget-analyze-user-contribution-time-distribution","version":"1.0.0","keywords":["Developer"],"description":"Analyze and plot user contributions over time. Recognize peak periods of activity for different users.","author":"OSSInsight"}, isJsx: true },
    () => import("./analyze/user/contribution-time-distribution/params.json"),
    () => import("./analyze/user/contribution-time-distribution/datasource.json"),
    () => import("./analyze/user/contribution-time-distribution/visualization.tsx"),
    () => import("./analyze/user/contribution-time-distribution/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-stars-map",
    {...{"name":"@ossinsight/widget-analyze-repo-stars-map","version":"1.0.0","keywords":["Repository","Star","Pull Request","Issue","Map"],"description":"Visualize and compare the geographic distribution of stars worldwide.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/stars-map/params.json"),
    () => import("./analyze/repo/stars-map/datasource.json"),
    () => import("./analyze/repo/stars-map/visualization.ts"),
    () => import("./analyze/repo/stars-map/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-stars-history",
    {...{"name":"@ossinsight/widget-analyze-repo-stars-history","version":"1.0.0","keywords":["Repository","Star"],"description":"Analyze and compare historical trends in star count for the repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/stars-history/params.json"),
    () => import("./analyze/repo/stars-history/datasource.json"),
    () => import("./analyze/repo/stars-history/visualization.ts"),
    () => import("./analyze/repo/stars-history/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-top-contributors",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-top-contributors","version":"1.0.0","private":true,"keywords":["Repository","contributors"],"description":"Recent top contributors of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-top-contributors/params.json"),
    () => import("./analyze/repo/recent-top-contributors/datasource.json"),
    () => import("./analyze/repo/recent-top-contributors/visualization.ts"),
    () => import("./analyze/repo/recent-top-contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-stars",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-stars","version":"1.0.0","private":true,"keywords":["Repository","Stars"],"description":"[Last 28 days Stats] Show the recent star history of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-stars/params.json"),
    () => import("./analyze/repo/recent-stars/datasource.json"),
    () => import("./analyze/repo/recent-stars/visualization.ts"),
    () => import("./analyze/repo/recent-stars/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-pull-requests",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-pull-requests","version":"1.0.0","private":true,"keywords":["Repository","Pull Requests"],"description":"[Last 28 days Stats] Show the recent PR history of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-pull-requests/params.json"),
    () => import("./analyze/repo/recent-pull-requests/datasource.json"),
    () => import("./analyze/repo/recent-pull-requests/visualization.ts"),
    () => import("./analyze/repo/recent-pull-requests/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-issues",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-issues","version":"1.0.0","private":true,"keywords":["Repository","Issues"],"description":"[Last 28 days Stats] Show the recent issue history of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-issues/params.json"),
    () => import("./analyze/repo/recent-issues/datasource.json"),
    () => import("./analyze/repo/recent-issues/visualization.ts"),
    () => import("./analyze/repo/recent-issues/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-contributors",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-contributors","version":"1.0.0","private":true,"keywords":["Repository","Contributors"],"description":"[Last 28 days Stats] Show the recent contributors of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-contributors/params.json"),
    () => import("./analyze/repo/recent-contributors/datasource.json"),
    () => import("./analyze/repo/recent-contributors/visualization.ts"),
    () => import("./analyze/repo/recent-contributors/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-commits",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-commits","version":"1.0.0","private":true,"keywords":["Repository","Commits"],"description":"[Last 28 days Stats] Show the recent commit history of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-commits/params.json"),
    () => import("./analyze/repo/recent-commits/datasource.json"),
    () => import("./analyze/repo/recent-commits/visualization.ts"),
    () => import("./analyze/repo/recent-commits/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-recent-collaborative-productivity-metrics",
    {...{"name":"@ossinsight/widget-analyze-repo-recent-collaborative-productivity-metrics","version":"1.0.0","private":true,"keywords":["Repository"],"description":"[Last 28 days Stats] Show the recent collaborative productivity metrics.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/recent-collaborative-productivity-metrics/params.json"),
    () => import("./analyze/repo/recent-collaborative-productivity-metrics/datasource.json"),
    () => import("./analyze/repo/recent-collaborative-productivity-metrics/visualization.ts"),
    () => import("./analyze/repo/recent-collaborative-productivity-metrics/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-pushes-and-commits-per-month",
    {...{"name":"@ossinsight/widget-analyze-repo-pushes-and-commits-per-month","version":"1.0.0","keywords":["Repository","Commit","Push"],"description":"Analyze and compare the count of code submissions in the repository, including pushes and commits.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/pushes-and-commits-per-month/params.json"),
    () => import("./analyze/repo/pushes-and-commits-per-month/datasource.json"),
    () => import("./analyze/repo/pushes-and-commits-per-month/visualization.ts"),
    () => import("./analyze/repo/pushes-and-commits-per-month/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-pull-requests-size-per-month",
    {...{"name":"@ossinsight/widget-analyze-repo-pull-requests-size-per-month","version":"1.0.0","keywords":["Repository","Pull Request"],"description":"Examine and compare pull request sizes across different months.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/pull-requests-size/params.json"),
    () => import("./analyze/repo/pull-requests-size/datasource.json"),
    () => import("./analyze/repo/pull-requests-size/visualization.ts"),
    () => import("./analyze/repo/pull-requests-size/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-pull-request-open-to-merged",
    {...{"name":"@ossinsight/widget-analyze-repo-pull-request-open-to-merged","version":"1.0.0","keywords":["Repository","Pull Request"],"description":"Analyze and compare the open-to-merge time for pull requests.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/pull-request-open-to-merged/params.json"),
    () => import("./analyze/repo/pull-request-open-to-merged/datasource.json"),
    () => import("./analyze/repo/pull-request-open-to-merged/visualization.ts"),
    () => import("./analyze/repo/pull-request-open-to-merged/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-loc-per-month",
    {...{"name":"@ossinsight/widget-analyze-repo-loc-per-month","version":"1.0.0","keywords":["Repository"],"description":"Monitor and compare lines of code added/deleted per month.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/loc-per-month/params.json"),
    () => import("./analyze/repo/loc-per-month/datasource.json"),
    () => import("./analyze/repo/loc-per-month/visualization.ts"),
    () => import("./analyze/repo/loc-per-month/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-issue-opened-and-closed",
    {...{"name":"@ossinsight/widget-analyze-repo-issue-opened-and-closed","version":"1.0.0","keywords":["Repository","issue"],"description":"Analyze and compare the count of opened and closed issues within the repository. ","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/issue-opened-and-closed/params.json"),
    () => import("./analyze/repo/issue-opened-and-closed/datasource.json"),
    () => import("./analyze/repo/issue-opened-and-closed/visualization.ts"),
    () => import("./analyze/repo/issue-opened-and-closed/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-issue-open-to-first-responded",
    {...{"name":"@ossinsight/widget-analyze-repo-issue-open-to-first-responded","version":"1.0.0","keywords":["Repository","issue"],"description":"Measure and compare first response times to issues. Identify bottlenecks and assess response efficiency.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/issue-open-to-first-responded/params.json"),
    () => import("./analyze/repo/issue-open-to-first-responded/datasource.json"),
    () => import("./analyze/repo/issue-open-to-first-responded/visualization.ts"),
    () => import("./analyze/repo/issue-open-to-first-responded/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-company",
    {...{"name":"@ossinsight/widget-analyze-repo-company","version":"1.0.0","keywords":["Repository","Company"],"description":"Analyze and compare company affiliations of repository stargazers, pull request submitters, and issue creators.","author":"OSSInsight"}, isJsx: true },
    () => import("./analyze/repo/company/params.json"),
    () => import("./analyze/repo/company/datasource.json"),
    () => import("./analyze/repo/company/visualization.tsx"),
    () => import("./analyze/repo/company/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-commits-time-distribution",
    {...{"name":"@ossinsight/widget-analyze-repo-commits-time-distribution","version":"1.0.0","keywords":["Repository","Commit"],"description":"Analyze and compare the preferred times for code submissions by individuals in repositories.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/commits-time-distribution/params.json"),
    () => import("./analyze/repo/commits-time-distribution/datasource.json"),
    () => import("./analyze/repo/commits-time-distribution/visualization.ts"),
    () => import("./analyze/repo/commits-time-distribution/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-repo-activity-trends",
    {...{"name":"@ossinsight/widget-analyze-repo-activity-trends","version":"1.0.0","private":true,"keywords":["Repository","Activity"],"description":"Show the activity trends of a GitHub repository.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/repo/activity-trends/params.json"),
    () => import("./analyze/repo/activity-trends/datasource.json"),
    () => import("./analyze/repo/activity-trends/visualization.ts"),
    () => import("./analyze/repo/activity-trends/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-recent-stats",
    {...{"name":"@ossinsight/widget-analyze-org-recent-stats","version":"1.0.0","keywords":["Organization"],"description":"Activity trends for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/recent-stats/params.json"),
    () => import("./analyze/org/recent-stats/datasource.json"),
    () => import("./analyze/org/recent-stats/visualization.ts"),
    () => import("./analyze/org/recent-stats/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-recent-pr-review-stats",
    {...{"name":"@ossinsight/widget-analyze-org-recent-pr-review-stats","version":"1.0.0","keywords":["Organization"],"description":"Pull request review trends for an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/recent-pr-review-stats/params.json"),
    () => import("./analyze/org/recent-pr-review-stats/datasource.json"),
    () => import("./analyze/org/recent-pr-review-stats/visualization.ts"),
    () => import("./analyze/org/recent-pr-review-stats/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-pull-requests-open-to-review",
    {...{"name":"@ossinsight/widget-analyze-org-pull-requests-open-to-review","version":"1.0.0","private":true,"keywords":["Organization"],"description":"Ranking of repos with most proactive Pull Request Review responses of an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/pull-requests-open-to-review/params.json"),
    () => import("./analyze/org/pull-requests-open-to-review/datasource.json"),
    () => import("./analyze/org/pull-requests-open-to-review/visualization.ts"),
    () => import("./analyze/org/pull-requests-open-to-review/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-engagement-scatter",
    {...{"name":"@ossinsight/widget-analyze-org-engagement-scatter","version":"1.0.0","private":true,"keywords":["Organization"],"description":"Most engaged people in an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/engagement-scatter/params.json"),
    () => import("./analyze/org/engagement-scatter/datasource.json"),
    () => import("./analyze/org/engagement-scatter/visualization.ts"),
    () => import("./analyze/org/engagement-scatter/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-company",
    {...{"name":"@ossinsight/widget-analyze-org-company","version":"1.0.0","private":true,"keywords":["Organization","Company"],"description":"Analyze company affiliations of repository stargazers and participants.","author":"OSSInsight"}, isJsx: true },
    () => import("./analyze/org/company/params.json"),
    () => import("./analyze/org/company/datasource.json"),
    () => import("./analyze/org/company/visualization.tsx"),
    () => import("./analyze/org/company/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-commits-time-distribution",
    {...{"name":"@ossinsight/widget-analyze-org-commits-time-distribution","version":"1.0.0","keywords":["Organization"],"description":"Commits Time Distribution of an Organization","author":"OSSInsight"}, isJsx: true },
    () => import("./analyze/org/commits-time-distribution/params.json"),
    () => import("./analyze/org/commits-time-distribution/datasource.json"),
    () => import("./analyze/org/commits-time-distribution/visualization.tsx"),
    () => import("./analyze/org/commits-time-distribution/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-open-to-first-response",
    {...{"name":"@ossinsight/widget-analyze-org-activity-open-to-first-response","version":"1.0.0","private":true,"keywords":["Organization"],"description":"Measure and compare first response times to issues/PRs. Identify bottlenecks and assess response efficiency.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-open-to-first-response/params.json"),
    () => import("./analyze/org/activity-open-to-first-response/datasource.json"),
    () => import("./analyze/org/activity-open-to-first-response/visualization.ts"),
    () => import("./analyze/org/activity-open-to-first-response/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-open-to-close",
    {...{"name":"@ossinsight/widget-analyze-org-activity-open-to-close","version":"1.0.0","private":true,"keywords":["Organization"],"description":"Measure and compare completion time to issues/prs. Identify bottlenecks and assess response efficiency.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-open-to-close/params.json"),
    () => import("./analyze/org/activity-open-to-close/datasource.json"),
    () => import("./analyze/org/activity-open-to-close/visualization.ts"),
    () => import("./analyze/org/activity-open-to-close/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-map",
    {...{"name":"@ossinsight/widget-analyze-org-activity-map","version":"1.0.0","private":true,"keywords":["Organization"],"description":"Visualize and compare the geographic distribution of stars/participants worldwide.","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-map/params.json"),
    () => import("./analyze/org/activity-map/datasource.json"),
    () => import("./analyze/org/activity-map/visualization.ts"),
    () => import("./analyze/org/activity-map/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-efficiency",
    {...{"name":"@ossinsight/widget-analyze-org-activity-efficiency","version":"1.0.0","keywords":["Organization"],"description":"TODO analyze-org-activity-efficiency","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-efficiency/params.json"),
    () => import("./analyze/org/activity-efficiency/datasource.json"),
    () => import("./analyze/org/activity-efficiency/visualization.ts"),
    () => import("./analyze/org/activity-efficiency/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-action-top-repos",
    {...{"name":"@ossinsight/widget-analyze-org-activity-action-top-repos","version":"1.0.0","keywords":["Organization"],"description":"Ranking of repos with the most avtivities in an organization","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-action-top-repos/params.json"),
    () => import("./analyze/org/activity-action-top-repos/datasource.json"),
    () => import("./analyze/org/activity-action-top-repos/visualization.ts"),
    () => import("./analyze/org/activity-action-top-repos/metadata.ts")
  ],
  [
    "@ossinsight/widget-analyze-org-activity-action-ratio",
    {...{"name":"@ossinsight/widget-analyze-org-activity-action-ratio","version":"1.0.0","private":true,"keywords":["Organization"],"description":"TODO","author":"OSSInsight"}, isJsx: false },
    () => import("./analyze/org/activity-action-ratio/params.json"),
    () => import("./analyze/org/activity-action-ratio/datasource.json"),
    () => import("./analyze/org/activity-action-ratio/visualization.ts"),
    () => import("./analyze/org/activity-action-ratio/metadata.ts")
  ],
]

const modules = Object.seal(_modules.reduce((modules, [name, {isJsx, ...meta}, p, d, v, m]) => {
  const module = {};
  module.meta = meta;
  module.parameterDefinition = () => p().then(module => module.default);
  module.datasourceFetcher = createFetcher(d);
  module.visualizer = makeVisualizer(v, isJsx);
  module.metadataGenerator = () => m().then(module => module.default);

  modules[name] = module;
  return modules;
}, {}));

const visualizers = Object.entries(modules).reduce((res, [name, module]) => {
  res[name] = module.visualizer;
  return res;
}, {});

const parameterDefinitions = Object.entries(modules).reduce((res, [name, module]) => {
  res[name] = module.parameterDefinition;
  return res;
}, {});

const datasourceFetchers = Object.entries(modules).reduce((res, [name, module]) => {
  res[name] = module.datasourceFetcher;
  return res;
}, {});

const metadataGenerators = Object.entries(modules).reduce((res, [name, module]) => {
  res[name] = module.metadataGenerator;
  return res;
}, {});

export default modules;
export { visualizers, parameterDefinitions, datasourceFetchers, metadataGenerators };
