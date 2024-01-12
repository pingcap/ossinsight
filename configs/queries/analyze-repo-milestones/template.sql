SELECT
    srm.id AS milestone_id,
    milestone_type_id,
    srmt.name AS milestone_type_name,
    milestone_number,
    payload,
    reached_at
FROM sys_repo_milestones srm
JOIN sys_repo_milestone_types srmt ON srm.milestone_type_id = srmt.id
WHERE
    repo_id = 41986369
ORDER BY reached_at DESC
LIMIT 200;