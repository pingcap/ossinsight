WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), repos_with_stars AS (
    SELECT
        repo_id,
        COUNT(*) AS stars
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY repo_id
    ORDER BY stars DESC
    LIMIT 10
)
SELECT
    gr.repo_id,
    gr.repo_name,
    rws.stars
FROM repos_with_stars rws
JOIN github_repos gr USING (repo_id)
ORDER BY stars DESC
LIMIT 10




