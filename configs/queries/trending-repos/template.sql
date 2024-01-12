WITH stars AS (
    SELECT
        /*+ READ_FROM_STORAGE(tiflash[ge]) */
        ge.repo_id AS repo_id,
        COUNT(1) AS total,
        COUNT(DISTINCT actor_id) AS actors,
        -- Calculate the score of each star according to the time of the star, the closer to the
        -- current time, the higher the score got, the score range is between 2-5. Then sum the
        -- scores of all stars to get the total score obtained from the stars for the repository.
        {% case period %}
        {% when 'past_3_months' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 3 MONTH), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 3 MONTH), NOW()) * 3 + 2)
        {% when 'past_month' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 MONTH), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 MONTH), NOW()) * 3 + 2)
        {% when 'past_week' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 WEEK), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 WEEK), NOW()) * 3 + 2)
        {% else %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 24 HOUR), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 24 HOUR), NOW()) * 3 + 2)
        {% endcase %} AS score
    FROM github_events ge
    WHERE
        -- Notice: In the GitHub events, WatchEvent means star, not watch.
        type = 'WatchEvent'
        {% case period %}
        {% when 'past_3_months' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        {% when 'past_month' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        {% when 'past_week' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        {% else %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        {% endcase %}
    GROUP BY ge.repo_id
    -- Exclude code repositories that use the same user to duplicate stars.
    HAVING actors > 0.9 * total
), forks AS (
    SELECT
        /*+ READ_FROM_STORAGE(tiflash[ge]) */
        ge.repo_id AS repo_id,
        COUNT(1) AS total,
        COUNT(DISTINCT actor_id) AS actors,
        -- Calculate the score of each fork according to the time of the fork, the closer to the
        -- current time, the higher the score got, the score range is between 1-4. Then sum the
        -- scores of all forks to get the total score obtained from the forks for the repository.
        {% case period %}
        {% when 'past_3_months' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 3 MONTH), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 3 MONTH), NOW()) * 3 + 1)
        {% when 'past_month' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 MONTH), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 MONTH), NOW()) * 3 + 1)
        {% when 'past_week' %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 WEEK), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 1 WEEK), NOW()) * 3 + 1)
        {% else %}
        SUM(TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 24 HOUR), ge.created_at) / TIMESTAMPDIFF(SECOND, DATE_SUB(NOW(), INTERVAL 24 HOUR), NOW()) * 3 + 1)
        {% endcase %} AS score
    FROM github_events ge
    WHERE
        type = 'ForkEvent'
        {% case period %}
        {% when 'past_3_months' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        {% when 'past_month' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        {% when 'past_week' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        {% else %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        {% endcase %}
    GROUP BY ge.repo_id
    -- Exclude code repositories that use the same user to duplicate forks.
    HAVING actors > 0.9 * total
), topRepos AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[r]) */
        r.repo_id,
        r.repo_name,
        r.primary_language,
        r.description,
        s.total AS stars_inc,
        IFNULL(f.total, 0) AS forks_inc,
        -- Calculate the composite score for the repository.
        SUM(
            s.score +
            IFNULL(f.score, 0) +
            -- Give the new repository a higher score base.
            (1 /  (1 + TIMESTAMPDIFF(YEAR, r.created_at, NOW()))) * 200
        ) AS total_score
    FROM github_repos r
    JOIN stars s ON r.repo_id = s.repo_id
    LEFT JOIN forks f ON r.repo_id = f.repo_id
    WHERE
        -- Filter rule: The repository must have at least 5 stars.
        stars > 5
        AND (
            r.stars < 50000
            OR (s.total / r.stars) > 0.01
        )
        -- Filter rule: The repository must have at least 5 forks.
        AND forks > 5
        -- Filter rule: The repository must have pushed new code within the last three months.
        AND pushed_at > DATE_SUB(NOW(), INTERVAL 3 MONTH)
        -- Filter rule: Exclude some malicious new repositories.
        AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
        {% if language != 'All' %}
        -- Filter by repository language.
        AND primary_language = '{{language}}'
        {% endif %}
        AND repo_name NOT IN (SELECT /*+ READ_FROM_STORAGE(TIFLASH[br]) */ name FROM blacklist_repos br)
        AND is_deleted = 0
    GROUP BY r.repo_id
    ORDER BY total_score DESC
    LIMIT 100
), pull_requests AS (
    SELECT
        ge.repo_id AS repo_id,
        COUNT(1) AS total
    FROM github_events ge
    JOIN topRepos tr ON ge.repo_id = tr.repo_id
    WHERE
        ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        AND ge.actor_login NOT LIKE '%[bot]'
        {% case period %}
        {% when 'past_3_months' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        {% when 'past_month' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        {% when 'past_week' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        {% else %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        {% endcase %}
    GROUP BY ge.repo_id
), pushes AS (
    SELECT
        ge.repo_id AS repo_id,
        COUNT(1) AS total
    FROM github_events ge
    JOIN topRepos tr ON ge.repo_id = tr.repo_id
    WHERE
        ge.type = 'PushEvent'
        AND ge.actor_login NOT LIKE '%[bot]'
        {% case period %}
        {% when 'past_3_months' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        {% when 'past_month' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        {% when 'past_week' %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        {% else %}
        AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        {% endcase %}
    GROUP BY ge.repo_id
), repo_with_top_contributors AS (
    SELECT
        repo_id, SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT actor_login ORDER BY cnt DESC SEPARATOR ','), ',', 5) AS actor_logins
    FROM (
        SELECT
            ge.repo_id AS repo_id,
            ge.actor_login AS actor_login,
            COUNT(*) AS cnt
        FROM github_events ge
        WHERE
            (
                (type = 'PullRequestEvent' AND action = 'opened') OR
                (type = 'IssuesEvent' AND action = 'opened') OR
                (type = 'PullRequestReviewEvent' AND action = 'created') OR
                (type = 'PushEvent' AND action = '')
            )
            AND ge.repo_id IN (SELECT tr.repo_id FROM topRepos tr)
            AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
            AND ge.actor_login NOT LIKE '%bot%'
            {% case period %}
            {% when 'past_3_months' %}
            AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            {% when 'past_month' %}
            AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            {% when 'past_week' %}
            AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
            {% else %}
            AND ge.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            {% endcase %}
        GROUP BY ge.repo_id, ge.actor_login
    ) sub
    GROUP BY repo_id
), repo_with_collections AS (
    SELECT
        /*+ READ_FROM_STORAGE(tikv[ci, c]) */
        tr.repo_id, GROUP_CONCAT(DISTINCT c.name) AS collection_names
    FROM topRepos tr
    JOIN collection_items ci ON ci.repo_name = tr.repo_name
    JOIN collections c ON ci.collection_id = c.id
    WHERE c.public = true
    GROUP BY tr.repo_id
)
SELECT
    tr.repo_id,
    tr.repo_name,
    tr.primary_language AS language,
    tr.description,
    tr.stars_inc AS stars,
    tr.forks_inc AS forks,
    pr.total AS pull_requests,
    pu.total AS pushes,
    tr.total_score,
    tc.actor_logins AS contributor_logins,
    rc.collection_names AS collection_names
FROM
	topRepos tr
    LEFT JOIN repo_with_top_contributors tc ON tr.repo_id = tc.repo_id
    LEFT JOIN repo_with_collections rc ON tr.repo_id = rc.repo_id
    LEFT JOIN pull_requests pr ON tr.repo_id = pr.repo_id
    LEFT JOIN pushes pu ON tr.repo_id = pu.repo_id
ORDER BY total_score DESC
;
