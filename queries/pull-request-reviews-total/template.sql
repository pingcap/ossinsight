select count(distinct id)
from github_events
use index(index_github_events_on_repo_id)
where repo_id = 41986369 and type = 'PullRequestReviewCommentEvent';
