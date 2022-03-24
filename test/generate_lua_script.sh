single_template_file="pull-request-creators-map.lua"
#two_template_file="stars-history.lua"
scripts_dir="test/scripts/"
single_repo_queries=(
  "stars-total"
  "stars-map"
  "stars-top-50-company"
  "stars-max-by-week"
  "stars-map"
  "stars-average-by-week"
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

  "recent-events-rank"
  "contributors-history"
  "contributors-hourly"
  "contributors-per-year"
  "events-history"
  "events-hourly"
  "events-per-year"
  "rt-top5-languages"
  "rt-top10-by-prs"
  "rt-top10-by-stars"
  "rt-top10-star-racing"
  "rt-top20-by-developers"
  "rt-top20-companies"
  "rt-top20-countries"
  "rt-top20-developers"
  "archive-2021-bottom10-by-yoy"
  "archive-2021-top5-by-languages"
  "archive-2021-top10-by-prs"
  "archive-2021-top10-by-regions"
  "archive-2021-top10-by-stars"
  "archive-2021-top10-star-racing"
  "archive-2021-top20-by-companies"
  "archive-2021-top20-by-developers"
  "archive-2021-top20-by-stars-yoy"
)
#two_repos_queries=(
#
#)

for query_name in "${single_repo_queries[@]}"
do
  echo "Generating target lua script file: ${query_name}"
  target_script_file=$scripts_dir$query_name".lua"
  cp $scripts_dir$single_template_file "$target_script_file"
  sed -i '' "s/pull-request-creators-map/${query_name}/g" "$target_script_file" > /dev/null
done

#
#for query_name in "${two_repos_queries[@]}"
#do
#  echo "Generating target lua script file: ${query_name}"
#  target_script_file=$scripts_dir$query_name".lua"
#  cp $scripts_dir$two_template_file "$target_script_file"
#  sed -i '' "s/stars-history/${query_name}/g" "$target_script_file" > /dev/null
#done
