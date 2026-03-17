SELECT
    gr.repo_name,
    gr.description,
    gr.stars,
    gr.primary_language AS language,
    COUNT(*) AS shared_topics
FROM github_repo_topics t1
JOIN github_repo_topics t2 ON t1.topic = t2.topic AND t2.repo_id != 41986369
JOIN github_repos gr ON gr.repo_id = t2.repo_id AND gr.is_deleted = 0
WHERE t1.repo_id = 41986369
GROUP BY t2.repo_id
HAVING shared_topics >= 2
ORDER BY shared_topics DESC, gr.stars DESC
LIMIT 10
