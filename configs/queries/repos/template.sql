SELECT
    gr.repo_id,
    gr.repo_name,
    gr.owner_id,
    gr.owner_login,
    gr.owner_is_org
FROM github_repos gr
WHERE
    {% if repoId.size > 0 %}
    gr.repo_id IN ({{ repoId | join: ',' }})
    {% endif %}
