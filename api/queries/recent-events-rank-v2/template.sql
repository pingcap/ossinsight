WITH top20repos AS (
    SELECT
        ge.repo_id AS repo_id,
        ANY_VALUE(repo_name) AS repo_name,
        ANY_VALUE(sub.language) AS language,
        IFNULL(COUNT(DISTINCT ge.actor_id), 0) AS stars
    FROM github_events ge
    LEFT JOIN (
        SELECT ge2.repo_id, MIN(ge2.language) AS language
        FROM github_events ge2
        WHERE
            ge2.type = 'PullRequestEvent'
            AND ge2.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
            AND ge2.created_at < NOW()
        GROUP BY ge2.repo_id
    ) sub ON ge.repo_id = sub.repo_id
    WHERE
        ge.type = 'WatchEvent'
        AND (ge.created_at BETWEEN '2022-04-04 02:59:59' AND '2022-05-04 02:59:59')
        AND ge.actor_login NOT LIKE '%bot%'
        AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
        AND ge.repo_name NOT IN (SELECT br.name FROM blacklist_repos br)
        AND sub.language = 'Java'
    GROUP BY ge.repo_id
    -- Order by repositroy stars.
    ORDER BY stars DESC
    LIMIT 20
), repo_with_top_contributors AS (
    SELECT
        repo_id, GROUP_CONCAT(DISTINCT actor_login) AS actor_logins
    FROM (
        SELECT
            repo_id,
            actor_login,
            ROW_NUMBER() OVER (PARTITION BY repo_id ORDER BY cnt DESC) AS num
        FROM (
            SELECT
                ge.repo_id AS repo_id,
                ge.actor_login AS actor_login,
                IFNULL(COUNT(*), 0) AS cnt
            FROM github_events ge
            WHERE
                type IN ('PullRequestEvent', 'IssuesEvent', 'PullRequestReviewEvent', 'PushEvent')
                AND (ge.created_at BETWEEN '2022-04-04 02:59:59' AND '2022-05-04 02:59:59')
                AND ge.repo_id IN (SELECT tr.repo_id FROM top20repos tr)
                AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
                AND ge.actor_login NOT LIKE '%bot%'
            GROUP BY ge.repo_id, ge.actor_login
            ORDER BY ge.repo_id, cnt DESC
        ) sub
    ) AS c
    WHERE num <= 5
    GROUP BY repo_id
), repo_with_collections AS (
    SELECT tr.repo_id, GROUP_CONCAT(DISTINCT c.name) AS collection_names
    FROM top20repos tr
    JOIN collection_items ci ON ci.repo_name = tr.repo_name
    JOIN collections c ON ci.collection_id = c.id
    WHERE c.public = true
    GROUP BY tr.repo_id
), events AS (
    SELECT
        ge.repo_id AS repo_id,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        ge.created_at BETWEEN '2022-04-04 02:59:59' AND '2022-05-04 02:59:59'
        AND ge.actor_login NOT LIKE '%bot%'
        AND ge.repo_id IN (SELECT tr.repo_id FROM top20repos tr)
        AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
    GROUP BY ge.repo_id
), pushes AS (
    SELECT
        ge.repo_id AS repo_id,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        ge.type = 'PushEvent'
        AND (ge.created_at BETWEEN '2022-04-04 02:59:59' AND '2022-05-04 02:59:59')
        AND ge.actor_login NOT LIKE '%bot%'
        AND ge.repo_id IN (SELECT tr.repo_id FROM top20repos tr)
        AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
    GROUP BY ge.repo_id
), pull_requests AS (
    SELECT
        ge.repo_id AS repo_id,
        COUNT(DISTINCT ge.pr_or_issue_id) AS cnt
    FROM github_events ge
    WHERE
        ge.type = 'PullRequestEvent' AND ge.action = 'opened'
        AND (ge.created_at BETWEEN '2022-04-04 02:59:59' AND '2022-05-04 02:59:59')
        AND ge.actor_login NOT LIKE '%bot%'
        AND ge.repo_id IN (SELECT tr.repo_id FROM top20repos tr)
        AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
    GROUP BY ge.repo_id
)
SELECT
    tr.repo_id,
    tr.repo_name,
    tr.language,
    tr.stars AS stars,
    IFNULL(p.cnt, 0) AS pushes,
    IFNULL(pr.cnt, 0) AS pull_requests,
    IFNULL(e.cnt, 0) AS events,
    tc.actor_logins AS contributor_logins,
    rc.collection_names AS collection_names
FROM top20repos tr
JOIN events e ON tr.repo_id = e.repo_id
LEFT JOIN repo_with_top_contributors tc ON tr.repo_id = tc.repo_id
LEFT JOIN repo_with_collections rc ON tr.repo_id = rc.repo_id
LEFT JOIN pushes p ON tr.repo_id = p.repo_id
LEFT JOIN pull_requests pr ON tr.repo_id = pr.repo_id
ORDER BY tr.stars DESC
;
