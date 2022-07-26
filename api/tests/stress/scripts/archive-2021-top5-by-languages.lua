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

repos = {
    "db_repos",
    "js_framework_repos",
    "nocode_repos",
    "programming_language_repos",
    "web_framework_repos"
}

wrk.method = "GET"
wrk.scheme = "https"

request = function()
    range = math.ceil(#repos / thread_count)
    offset = (id - 1) * range
    current = repos[(offset + counter) % #repos + 1]
    path = "https://api.ossinsight.io/q/archive-2021-top5-by-languages?repo=" .. current
    counter = counter + 1
    return wrk.format(nil, path)
end
