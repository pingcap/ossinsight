# Siangle Repo.
scripts_dir="test/scripts/"

single_template_file="pull-request-creators-map.lua"
single_repo_queries=(
  "stars-total"
  "stars-map"
  "stars-top-50-company"
  "stars-max-by-week"
  "stars-map"
  "stars-average-by-week"
  "stars-history"
  "pushes-total"
  "pushers-total"
  "pull-requests-total"
  "pull-request-reviews-total"
  "pull-request-reviewers-total"
  "pull-request-creators-total"
  "pull-request-creators-top-50-company"
  "pull-requests-history"
  "pull-request-creators-per-month"
  "issues-total"
  "issue-creators-total"
  "issue-comments-total"
  "issue-commenters-total"
  "issue-creators-top-50-company"
  "issue-creators-map"
  "forkers-total"
  "committers-total"
  "commits-total"
  "commit-commenters-total"
  "commits-time-distribution"

  "analyze-issue-creators-company"
  "analyze-issue-open-to-closed"
  "analyze-issue-open-to-first-responded"
  "analyze-issue-opened-and-closed"
  "analyze-loc-per-month"
  "analyze-pull-request-creators-company"
  "analyze-pull-request-open-to-merged"
  "analyze-pull-requests-size-per-month"
  "analyze-pushes-and-commits-per-month"
  "analyze-release-history"
  "analyze-release-per-month"
  "analyze-stars-company"
)

for query_name in "${single_repo_queries[@]}"
do
  echo "Generating target lua script file: ${query_name}"
  target_script_file=$scripts_dir$query_name".lua"
  cp $scripts_dir$single_template_file "$target_script_file"
  sed -i '' "s/pull-request-creators-map/${query_name}/g" "$target_script_file" > /dev/null
done

# Insight Repo.
insight_template_file="archive-2021-bottom10-by-yoy.lua"
insight_repo_queries=(
  # "events-last-imported"
  # "events-total"
  # "recent-events-rank"
  # "events-history"
  # "events-hourly"
  # "events-per-year"
  # "contributors-history"
  # "contributors-hourly"
  # "contributors-per-year"

  "rt-top5-languages"
  "rt-top10-by-prs"
  "rt-top10-by-stars"
  "rt-top10-star-racing"
  "rt-top20-by-developers"
  "rt-top20-companies"
  "rt-top20-countries"
  "rt-top20-developers"

  "archive-2021-top5-by-languages"
  "archive-2021-top10-by-prs"
  "archive-2021-top10-by-regions"
  "archive-2021-top10-by-stars"
  "archive-2021-top10-star-racing"
  "archive-2021-top20-by-companies"
  "archive-2021-top20-by-developers"
  "archive-2021-top20-by-stars-yoy"
)


for query_name in "${insight_repo_queries[@]}"
do
  echo "Generating target lua script file: ${query_name}"
  target_script_file=$scripts_dir$query_name".lua"
  cp $scripts_dir$insight_template_file "$target_script_file"
  sed -i '' "s/archive-2021-bottom10-by-yoy/${query_name}/g" "$target_script_file" > /dev/null
done


# Two Repos.
#two_template_file="stars-history.lua"
#two_repos_queries=(
#
#)

#
#for query_name in "${two_repos_queries[@]}"
#do
#  echo "Generating target lua script file: ${query_name}"
#  target_script_file=$scripts_dir$query_name".lua"
#  cp $scripts_dir$two_template_file "$target_script_file"
#  sed -i '' "s/stars-history/${query_name}/g" "$target_script_file" > /dev/null
#done
