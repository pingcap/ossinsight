#!/usr/local/bin/lua
counter = 0

repos = {}
for line in io.lines("test/testdata/most-stars-repo-in-2021.csv") do
    local repoName = line:match("%s*(.+)")
    repos[#repos + 1] = repoName
end

reposList = {}
for i = 1, #repos do
    reposList[i] = {}
    reposList[i]["repo1"] = repos[i]
    reposList[i]["repo2"] = repos[#repos - i]
end

wrk.method = "GET"
wrk.scheme = "http"

request = function()
    current = reposList[counter % #reposList + 1]
    path = "https://community-preview-contributor.tidb.io/q/stars-history?repoName1=" .. current.repo1 .. "&repoName2=" .. current.repo2
    counter = counter + 1
    return wrk.format(nil, path)
end

function response(status, headers, body)

end
