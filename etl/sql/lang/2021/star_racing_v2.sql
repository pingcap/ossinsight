WITH tmp AS (
  SELECT
    event_year,
    language AS repo_name,
    COUNT(*) AS year_stars
  FROM github_events
  WHERE type = 'PullRequestEvent' AND action = 'opened' and language is not null and language in (
    'Ruby',
    'Python',
    'C',
    'C++',
    'JavaScript',
    'TypeScript',
    'Java',
    'PHP',
    'Go',
    'C#',
    'Rust',
    'Scala',
    'Swift',
    'Kotlin',
    'Objective-C',
    'Elixir',
    'Crystal'
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
