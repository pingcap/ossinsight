WITH repos AS (
    SELECT
        gr.repo_id,
        gr.repo_name,
        gr.stars,
        gr.last_event_at
    FROM
        github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        AND gr.is_deleted = 0
), participants_summary AS (
    SELECT
        COUNT(DISTINCT user_login) AS participants
    FROM mv_repo_participants mrp
    WHERE
        mrp.repo_id IN (SELECT repo_id FROM repos)
), repos_summary AS (
    SELECT
        COUNT(*) AS public_repos,
        SUM(r.stars) AS stars,
        MAX(r.last_event_at) AS last_event_at
    FROM repos r
)
SELECT
    rs.public_repos,
    rs.stars,
    rs.last_event_at,
    ps.participants
FROM
    repos_summary rs,
    participants_summary ps
;
