WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), repos_with_activities AS (
    SELECT
        repo_id,
        SUM(mrde.engagements) AS activities
    FROM mv_repo_daily_engagements mrde
    WHERE
        mrde.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
            {% when 'past_7_days' %} AND mrde.day > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND mrde.day > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND mrde.day > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND mrde.day > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY repo_id
    ORDER BY activities DESC
    LIMIT 10
)
SELECT
    gr.repo_id,
    gr.repo_name,
    rwa.activities
FROM repos_with_activities rwa
JOIN github_repos gr USING (repo_id)
ORDER BY activities DESC
LIMIT 10




