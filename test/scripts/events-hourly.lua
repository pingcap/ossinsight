#!/usr/local/bin/lua
counter = 0

repos = {}
for line in io.lines("test/testdata/most-stars-repo-in-2021.csv") do
    local repoId = line:match("%s*(.+)")
    repos[#repos + 1] = repoId
end

wrk.method = "GET"
wrk.scheme = "https"

request = function()
    current = repos[counter % #repos + 1]
    path = "https://api.ossinsight.io/q/events-hourly?repoId=" .. current
    counter = counter + 1
    return wrk.format(nil, path)
end
