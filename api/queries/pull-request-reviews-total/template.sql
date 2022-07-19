select count(distinct id)
from github_events
where repo_id = 41986369 and type = 'PullRequestReviewCommentEvent';
