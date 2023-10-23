WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
),
{% if excludeSeenBefore %}
countries_seen_before AS (
    SELECT
        country_code
    FROM
        mv_repo_countries_stargazer_role b
    WHERE
        b.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
        {% when 'past_7_days' %} AND b.first_seen_at < (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND b.first_seen_at < (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND b.first_seen_at < (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND b.first_seen_at < (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY country_code
),
{% endif %}
stars_per_country AS (
    SELECT
        IF(gu.country_code IN ('', 'N/A', 'UND'), 'UND', gu.country_code) AS country_code,
        COUNT(*) AS stars
    FROM github_events ge
    JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'

        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}

        {% if excludeUnknown %}
        -- Exclude users with no country code.
        AND gu.country_code NOT IN ('', 'N/A', 'UND')
        {% endif %}

        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY gu.country_code
), stars_total AS (
    SELECT SUM(stars) AS stars_total FROM stars_per_country
)
SELECT
    spc.country_code,
    spc.stars,
    ROUND(spc.stars / st.stars_total, 2) AS percentage
FROM
    stars_per_country spc,
    stars_total st
{% if excludeSeenBefore %}
-- Exclude countries that have been seen before.
WHERE NOT EXISTS (SELECT 1 FROM countries_seen_before WHERE country_code = spc.country_code)
{% endif %}
ORDER BY spc.stars DESC
LIMIT {{ n }}
