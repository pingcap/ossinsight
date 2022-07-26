#!/usr/local/bin/lua
counter = 0

local t_counter = 1
local threads = {}

function setup(thread)
    thread:set("id", t_counter)
    table.insert(threads, thread)
    t_counter = t_counter + 1
    -- update all known threads with the latest thread count
    for _, t in ipairs(threads) do
        t:set("thread_count", t_counter)
    end
end

repos = {}
for line in io.lines("test/testdata/most-stars-repo-in-2021.csv") do
    local repoId = line:match("%s*(.+)")
    repos[#repos + 1] = repoId
end

wrk.method = "GET"
wrk.scheme = "https"

request = function()
    range = math.ceil(#repos / thread_count)
    offset = (id - 1) * range
    current = repos[(offset + counter) % #repos + 1]
    path = "https://api.ossinsight.io/q/analyze-issue-open-to-closed?repoId=" .. current
    counter = counter + 1
    return wrk.format(nil, path)
end
