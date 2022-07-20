WITH tmp AS (
  SELECT
    event_year,
    wf.name AS repo_name,
    COUNT(*) AS year_stars
  FROM github_events 
       JOIN js_framework_repos wf ON wf.id = github_events.repo_id
  WHERE type = 'WatchEvent' AND wf.name in (
      'vuejs/vue',
      'facebook/react',
      'angular/angular',
      'sveltejs/svelte',
      'preactjs/preact',
      'jashkenas/backbone',
      'Polymer/polymer',
      'emberjs/ember.js',
      'ionic-team/stencil',
      'hotwired/stimulus',
      'solidjs/solid',
      'jquery/jquery'
    )
  GROUP BY 2, 1
  ORDER BY 1 ASC, 2
), tmp1 AS (
  SELECT event_year,
         repo_name, 
         SUM(year_stars) OVER(partition by repo_name order by event_year ASC) as stars
         
  FROM tmp
  ORDER BY event_year ASC, repo_name 
)

SELECT event_year, repo_name, stars FROM tmp1
