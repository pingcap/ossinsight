# Test

## Stress Test

Test a single query:

```bash
wrk -t12 -c100 --latency -d30s -s test/scripts/pull-request-creators-map.lua https://community-preview-contributor.tidb.io
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

