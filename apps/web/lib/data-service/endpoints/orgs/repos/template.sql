SELECT
    gr.repo_id,
    gr.repo_name
FROM github_repos gr
WHERE
    gr.owner_id = {{ownerId}}
LIMIT 9999
