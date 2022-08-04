SELECT
    IFNULL(COUNT(DISTINCT number), 0) AS issues
FROM github_events
WHERE
    repo_id = 41986369
    AND type = 'IssuesEvent';
