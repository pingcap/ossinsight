---
sidebar_position: 5
title: FAQ
---

## Where does these data come from?

* Historical Data: http://gharchive.org/
* Realtime Data: https://docs.github.com/en/rest/activity/events#list-public-events

## Why the stars(or other metrics) on this site is different from that on GitHub?

5 reasons:
* GitHub /events api only publish WatchEvent(this means star), there is no UnWatchEvent;
* GitHub would lost data if there services were down;
* GitHub repo has switched between private and public;
* The repo data had issues, which were manually fixed by GitHub;
* The GitHub user login or repo name has changed;

