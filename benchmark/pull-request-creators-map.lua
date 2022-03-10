#!/usr/local/bin/lua
counter = 0

repos = {}
for line in io.lines("testdata/most-stars-repo-in-2021.csv") do
    local repoName = line:match("%s*(.+)")
    repos[#repos + 1] = repoName
end

wrk.method = "GET"
wrk.scheme = "http"

request = function()
    current = repos[counter % #repos + 1]
    path = "https://community-preview-contributor.tidb.io/q/pull-request-creators-map?repoName=" .. current
    print(path)
    counter = counter + 1
    return wrk.format(nil, path)
end

function response(status, headers, body)
    -- print("Query: pull-request-creators-map repoName=" .. current)
    -- print(body)
end
