WITH repo_with_last_event_at AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
        ge.repo_id AS repo_id,
        MAX(ge.created_at) AS last_event_at
    FROM github_events ge
    WHERE
        -- Only consider events that are relevant to the org.
        ge.org_id != 0
        AND ge.created_at >= :from
        AND ge.created_at < :to
    GROUP BY ge.repo_id
)
UPDATE github_repos gr, repo_with_last_event_at rwlea
SET gr.last_event_at = rwlea.last_event_at
WHERE
    gr.repo_id = rwlea.repo_id
    AND rwlea.last_event_at > gr.last_event_at
;