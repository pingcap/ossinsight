single_template_file="pull-request-creators-map.lua"
two_template_file="stars-history.lua"
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
  "issues-total"
  "issue-creators-total"
  "issue-comments-total"
  "issue-commenters-total"
  "forkers-total"
  "committers-total"
  "commits-total"
  "commit-commenters-total"
  "commits-time-distribution"
)
two_repos_queries=(
  "pull-requests-history"
  "pull-request-creators-per-month"
)


for query_name in "${single_repo_queries[@]}"
do
  echo "Generating target lua script file: ${query_name}"
  target_script_file=$scripts_dir$query_name".lua"
  cp $scripts_dir$single_template_file "$target_script_file"
  sed -i '' "s/pull-request-creators-map/${query_name}/g" "$target_script_file" > /dev/null
done

for query_name in "${two_repos_queries[@]}"
do
  echo "Generating target lua script file: ${query_name}"
  target_script_file=$scripts_dir$query_name".lua"
  cp $scripts_dir$two_template_file "$target_script_file"
  sed -i '' "s/stars-history/${query_name}/g" "$target_script_file" > /dev/null
done
