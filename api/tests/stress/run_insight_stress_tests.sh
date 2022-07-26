#!/bin/sh
# shellcheck disable=SC2086
# shellcheck disable=SC2002
# shellcheck disable=SC2006
# shellcheck disable=SC2039

SCRIPT_DIR="./test/scripts"
RESULT_DIR="./test/result"
REPORT_DIR="./test/report/"
BASE_URL="https://api.ossinsight.io/q/"

threads=${1-1}       # Number of threads to use.
connections=${2-1}   # Connections to keep open.
duration=${3-1}      # Duration of test.
input_file_name=$4   # The specified lua script file.

# The lua script files.
script_files=(
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

# Execute a single wrk task.
# param 1: lua script name
# param 2: threads
# param 3: connections
# param 4: base url
exec_single_wrk() {
  script_file="${SCRIPT_DIR}/$1"
  log_file=$RESULT_DIR"/$1_t$2_c$3_d${duration}_result.log"
  if [ -f "$script_file" ];then
    echo "Running script file: ${script_file}"
    wrk -t $2 -c $3 -d $duration --script=$script_file --latency --timeout 5 "$4" >$log_file 2>&1 &
  else
    echo "${script_file} is not exists"
  fi
}

exec_multiple_wrk(){
  for item_name in "${script_files[@]}"
  do
    exec_single_wrk "${item_name}.lua" $threads $connections $BASE_URL &
  done
}

if [ -n "$input_file_name" ]; then
  exec_single_wrk $input_file_name $threads $connections &
else
  exec_multiple_wrk &

  echo 'Waiting for all testes finished...'
  wait=`expr $duration + 5`
  sleep $wait

  report_file="${REPORT_DIR}/"`date "+%Y_%m_%d_%H_%M_%S"`"_t${threads}_c${connections}_d${duration}_insight.md"
  printf '# Performance Report\n\n' > "$report_file"
  echo '| Query Name | Average Latency | 50% Latency | 75% Latency | 90% Latency | 99% Latency | Request in Duration | Request/Sec | Socket Errors | HTTP Errors | ' >> "$report_file"
  echo '|  ----  | ----  | ----  | ----  | ----  | ----  | ----  | ----  | ----  | ----  |' >> "$report_file"

  for item_name in "${script_files[@]}"
  do
    log_file="${RESULT_DIR}/${item_name}.lua_t${threads}_c${connections}_d${duration}_result.log"
    average_latency=`cat "${log_file}" | grep -m 1 'Latency' | awk '{print $2}'`
    p50_latency=`cat "${log_file}" | grep -m 1 '50%' | awk '{print $2}'`
    p75_latency=`cat "${log_file}" | grep -m 1 '75%' | awk '{print $2}'`
    p90_latency=`cat "${log_file}" | grep -m 1 '90%' | awk '{print $2}'`
    p99_latency=`cat "${log_file}" | grep -m 1 '99%' | awk '{print $2}'`

    request_in_duration=`cat "${log_file}" | grep 'requests'`
    request_per_seconds=`cat "${log_file}" | grep 'Requests/sec' | awk '{print $2}'`
    socket_errors=`cat "${log_file}" | grep 'Socket errors'`
    http_errors=`cat "${log_file}" | grep 'Non-2xx or 3xx responses' | awk '{print $5}'`

    echo "| ${item_name} | ${average_latency} | ${p50_latency} | ${p75_latency} | ${p90_latency} | ${p99_latency} | ${request_in_duration} | ${request_per_seconds} | ${socket_errors} | ${http_errors} |" >> "$report_file"
  done
fi
