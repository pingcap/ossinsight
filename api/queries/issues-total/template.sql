select count(distinct number) from github_events
where repo_id = 41986369 and type = 'IssuesEvent' and action = 'opened';
