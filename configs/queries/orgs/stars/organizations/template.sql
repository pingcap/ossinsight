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
organizations_seen_before AS (
    SELECT
        org_name
    FROM
        mv_repo_organizations_stargazer_role b
    WHERE
        b.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
        {% when 'past_7_days' %} AND b.first_seen_at < (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND b.first_seen_at < (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND b.first_seen_at < (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND b.first_seen_at < (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY org_name
),
{% endif %}
stars_per_org AS (
    SELECT
        IF(
            gu.organization_formatted IS NOT NULL AND LENGTH(gu.organization_formatted) != 0,
            gu.organization_formatted,
            'Unknown'
        ) AS organization_name,
        COUNT(DISTINCT actor_login) AS stars
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
        -- Exclude users with no organization.
        AND gu.organization_formatted IS NOT NULL
        AND LENGTH(gu.organization_formatted) != 0
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY organization_name
), stars_total AS (
    SELECT SUM(stars) AS stars_total FROM stars_per_org
)
SELECT
    spo.organization_name,
    spo.stars,
    ROUND(spo.stars / st.stars_total, 2) AS percentage
FROM
    stars_per_org spo,
    stars_total st
{% if excludeSeenBefore %}
-- Exclude organizations that have been seen before.
WHERE NOT EXISTS (SELECT 1 FROM organizations_seen_before WHERE org_name = spo.organization_name)
{% endif %}
ORDER BY spo.stars DESC
LIMIT {{ n }}