select count(distinct number) from github_events
use index(index_github_events_on_repo_name)
where repo_name = 'pingcap/tidb' and type = 'PullRequestEvent';
