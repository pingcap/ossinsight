# Test

## Stress Test

Test a single query:

```bash
wrk -t12 -c100 --latency -d60s -s test/scripts/recent-events-rank.lua https://api.ossinsight.io
```

```
Running 1m test @ https://api.ossinsight.io
  16 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   644.96ms  396.38ms   2.00s    73.79%
    Req/Sec     7.43      5.44    40.00     84.20%
  Latency Distribution
     50%  542.78ms
     75%  828.65ms
     90%    1.25s 
     99%    1.83s 
  5453 requests in 1.00m, 65.49MB read
  Socket errors: connect 0, read 0, write 0, timeout 440
Requests/sec:     90.74
Transfer/sec:      1.09MB
```

Or:

```bash
./test/run_stress_tests.sh 1 1 1 pull-request-creators-map.lua
```

Test a multiple query at the same time:

The following command means that each query uses `1` thread and `100` connections to run a `10` seconds stress test.

```bash
./test/run_stress_tests.sh 1 100 10
```

