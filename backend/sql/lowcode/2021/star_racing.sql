WITH tmp AS (
  SELECT
    event_year,
    wf.name AS repo_name,
    COUNT(*) AS year_stars
  FROM github_events 
       JOIN nocode_repos wf ON wf.id = github_events.repo_id
  WHERE type = 'WatchEvent' AND wf.name in (
      'parse-community/parse-server',
      'tiangolo/fastapi',
      'strapi/strapi',
      'TryGhost/Ghost',
      'supabase/supabase',
      'hasura/graphql-engine',
      'nocodb/nocodb',
      'n8n-io/n8n',
      'appwrite/appwrite',
      'saleor/saleor ',
      'Budibase/budibase'
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
