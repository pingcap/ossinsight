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
    SUM(engagements) AS engagements
FROM mv_repo_daily_engagements
WHERE
    repo_id IN (SELECT repo_id FROM repos)
    {% case period %}
        {% when 'past_7_days' %} AND day > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND day > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND day > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND day > (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    {% if excludeBots %}
    -- Exclude bot users.
    AND LOWER(user_login) NOT LIKE '%bot%'
    AND user_login NOT IN (SELECT login FROM blacklist_users LIMIT 255)
    {% endif %}
GROUP BY user_login
ORDER BY 2 DESC
LIMIT {{ n }}