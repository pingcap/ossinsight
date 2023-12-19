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
    mrde.user_login AS login,
    SUM(mrde.engagements) AS engagements
FROM mv_repo_daily_engagements mrde
WHERE
    repo_id IN (SELECT repo_id FROM repos)
    {% case period %}
        {% when 'past_7_days' %} AND mrde.day > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND mrde.day > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND mrde.day > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND mrde.day > (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    {% if excludeBots %}
    -- Exclude bot users.
    AND LOWER(mrde.user_login) NOT LIKE '%bot%'
    AND mrde.user_login NOT IN (SELECT login FROM blacklist_users LIMIT 255)
    {% endif %}
    AND user_login != (SELECT owner_login FROM github_repos gr WHERE gr.owner_id = {{ownerId}} LIMIT 1)
    AND NOT EXISTS (
        SELECT 1
        FROM mv_repo_participants mrp
        WHERE
            mrp.repo_id IN (SELECT repo_id FROM repos)
            AND mrp.user_login = mrde.user_login
            {% case period %}
                {% when 'past_7_days' %}
                AND mrp.first_engagement_at < (CURRENT_DATE() - INTERVAL 7 DAY)
                {% when 'past_28_days' %}
                AND mrp.first_engagement_at < (CURRENT_DATE() - INTERVAL 28 DAY)
                {% when 'past_90_days' %}
                AND mrp.first_engagement_at < (CURRENT_DATE() - INTERVAL 90 DAY)
                {% when 'past_12_months' %}
                AND mrp.first_engagement_at < (CURRENT_DATE() - INTERVAL 12 MONTH)
            {% endcase %}
        LIMIT 1
    )
GROUP BY mrde.user_login
ORDER BY 2 DESC
LIMIT {{ n }}
