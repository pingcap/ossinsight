CREATE TEMP TABLE archive AS SELECT 
  coalesce(id, '0') as id,
  coalesce(type, '') as type,
  created_at,
  coalesce(repo.id, 0) as repo_id,
    coalesce(
    CASE repo.name
      WHEN '/' THEN json_value(payload, '$.repo')
      WHEN null THEN json_value(payload, '$.repo')
      ELSE repo.name
    END,
    ''
    )
  as repo_name,
  coalesce(actor.id, 0) as actor_id,
  coalesce(actor.login, '') as actor_login,
  coalesce(json_value(payload, '$.pull_request.base.repo.language'), '') as language,
  coalesce(json_value(payload, '$.pull_request.additions'), '0') as additions,
  coalesce(json_value(payload, '$.pull_request.deletions'), '0') as deletions,
  coalesce(json_value(payload, '$.action'), '') as action,
  coalesce(
    CASE 
      WHEN json_value(payload, '$.pull_request.number') is not null THEN json_value(payload, '$.pull_request.number')
      WHEN json_value(payload, '$.issue.number') is not null THEN json_value(payload, '$.issue.number')
      ELSE json_value(payload, '$.number')
    END,
  '0') 
  as number,
  coalesce(json_value(payload, '$.comment.commit_id'), '') as commit_id,
  coalesce(json_value(payload, '$.comment.id'), '0') as comment_id,
  coalesce(json_value(payload, '$.size'), '0') as push_size,
  coalesce(json_value(payload, '$.distinct_size'), '0') as push_distinct_size,
  coalesce(org.login, '') as org_login,
  coalesce(org.id, 0) as org_id,
  coalesce(
    CASE 
      WHEN json_value(payload, '$.pull_request.state') is not null THEN json_value(payload, '$.pull_request.state')
      WHEN json_value(payload, '$.issue.state') is not null THEN json_value(payload, '$.issue.state')
      ELSE null
    END,
  '') 
  as state,
  coalesce(
    CASE 
      WHEN json_value(payload, '$.pull_request.closed_at') is not null THEN json_value(payload, '$.pull_request.closed_at')
      WHEN json_value(payload, '$.issue.closed_at') is not null THEN json_value(payload, '$.issue.closed_at')
      ELSE null
    END,
  '1970-01-01 00:00:00') 
  as closed_at,
  coalesce(
    CASE 
      WHEN json_value(payload, '$.pull_request.comments') is not null THEN json_value(payload, '$.pull_request.comments')
      WHEN json_value(payload, '$.issue.comments') is not null THEN json_value(payload, '$.issue.comments')
      ELSE null
    END,
  '0') 
  as comments,

  coalesce(cast(cast(json_value(payload, '$.pull_request.merged') as bool) as int64), 0) as pr_merged,
  coalesce(json_value(payload, '$.pull_request.merged_at'), '1970-01-01 00:00:00') as pr_merged_at,
  coalesce(json_value(payload, '$.pull_request.changed_files'), '0') as pr_changed_files,
  coalesce(json_value(payload, '$.pull_request.review_comments'), '0') as pr_review_comments,
  coalesce(
    CASE 
      WHEN json_value(payload, '$.pull_request.id') is not null THEN json_value(payload, '$.pull_request.id')
      WHEN json_value(payload, '$.issue.id') is not null THEN json_value(payload, '$.issue.id')
      ELSE null
    END,
  '')
  as pr_or_issue_id,

  coalesce(
  CASE 
      WHEN json_value(payload, '$.comment.user.login') is not null THEN json_value(payload, '$.comment.user.login')
      WHEN json_value(payload, '$.review.user.login') is not null THEN json_value(payload, '$.review.user.login')
      WHEN json_value(payload, '$.issue.user.login') is not null THEN json_value(payload, '$.issue.user.login')
      WHEN json_value(payload, '$.pull_request.user.login') is not null THEN json_value(payload, '$.pull_request.user.login')
      ELSE null
    END,
  '')
  as creator_user_login,

  coalesce(
  CASE 
      WHEN json_value(payload, '$.comment.user.id') is not null THEN json_value(payload, '$.comment.user.id')
      WHEN json_value(payload, '$.review.user.id') is not null THEN json_value(payload, '$.review.user.id')
      WHEN json_value(payload, '$.issue.user.id') is not null THEN json_value(payload, '$.issue.user.id')
      WHEN json_value(payload, '$.pull_request.user.id') is not null THEN json_value(payload, '$.pull_request.user.id')
      ELSE null
    END,
  '0')
  as creator_user_id,

  coalesce(
  CASE 
      WHEN json_value(payload, '$.issue.created_at') is not null THEN json_value(payload, '$.issue.created_at')
      WHEN json_value(payload, '$.pull_request.created_at') is not null THEN json_value(payload, '$.pull_request.created_at')
      ELSE null
    END,
    '1970-01-01 00:00:00') 
  as pr_or_issue_created_at,

  FORMAT_DATE('%Y-%m-%d', created_at) as event_day,
  FORMAT_DATE('%Y-%m-01', created_at) as event_month,
  EXTRACT(year FROM created_at) as event_year
FROM `githubarchive.day.2*`;

EXPORT DATA OPTIONS(
  uri='gs://gharchive.live/new/gharchive_dev.github_events.*.csv',
  format='CSV',
  overwrite=true,
  header=true,
  field_delimiter=',') AS
  SELECT * FROM archive