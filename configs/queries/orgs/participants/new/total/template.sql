WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), current_period_new_participants AS (
    SELECT
        COUNT(*) AS new_participants
    FROM mv_repo_participants mrp
    WHERE
        mrp.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
            {% when 'past_7_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW()
            {% when 'past_28_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 28 DAY) AND NOW()
            {% when 'past_90_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 90 DAY) AND NOW()
            {% when 'past_12_months' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 12 MONTH) AND NOW()
        {% endcase %}
        {% if excludeBots %}
        -- Exclude bot users.
        AND LOWER(user_login) NOT LIKE '%bot%'
        AND user_login NOT IN (SELECT login FROM blacklist_users LIMIT 255)
        {% endif %}
), past_period_new_participants AS (
    SELECT
        COUNT(*) AS new_participants
    FROM mv_repo_participants mrp
    WHERE
        mrp.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
            {% when 'past_7_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 14 DAY) AND (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 56 DAY) AND (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 180 DAY) AND (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %}
            AND mrp.first_engagement_at BETWEEN (NOW() - INTERVAL 24 MONTH) AND (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
        {% if excludeBots %}
        -- Exclude bot users.
        AND LOWER(user_login) NOT LIKE '%bot%'
        AND user_login NOT IN (SELECT login FROM blacklist_users LIMIT 255)
        {% endif %}
)
SELECT
    cpnp.new_participants AS current_period_total,
    ppnp.new_participants AS past_period_total,
    (cpnp.new_participants - ppnp.new_participants) / ppnp.new_participants AS growth_percentage
FROM
    current_period_new_participants cpnp,
    past_period_new_participants ppnp
;