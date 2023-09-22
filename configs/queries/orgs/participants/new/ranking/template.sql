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
    gu.login AS login,
    mrp.first_engagement_at AS first_participated_at
FROM mv_repo_participants mrp
JOIN github_users gu ON mrp.user_id = gu.id
WHERE
    mrp.repo_id IN (SELECT repo_id FROM repos)
    {% case period %}
        {% when 'past_7_days' %}
        AND mrp.first_engagement_at >= (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %}
        AND mrp.first_engagement_at >= (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %}
        AND mrp.first_engagement_at >= (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %}
        AND mrp.first_engagement_at >= (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    {% if excludeBots %}
    -- Exclude bot users.
    AND gu.login NOT LIKE '%bot%'
    {% endif %}
ORDER BY first_participated_at DESC
LIMIT {{ n }}
