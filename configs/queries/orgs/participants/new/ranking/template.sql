WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
)
SELECT
    user_login AS login,
    MIN(first_engagement_at) AS first_participated_at
FROM mv_repo_participants mrp
WHERE
    repo_id IN (SELECT repo_id FROM repos)
    {% case period %}
        {% when 'past_7_days' %}
        AND first_engagement_at >= (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %}
        AND first_engagement_at >= (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %}
        AND first_engagement_at >= (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %}
        AND first_engagement_at >= (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    {% if excludeBots %}
    -- Exclude bot users.
    AND user_login NOT LIKE '%bot%'
    {% endif %}
GROUP BY user_login
ORDER BY first_participated_at DESC
LIMIT {{ n }}
