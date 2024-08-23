CREATE TABLE IF NOT EXISTS github_oss_contributors (
    actor_id INT(11) PRIMARY KEY,
    commits INT(11) NOT NULL DEFAULT 0,
    prs INT(11) NOT NULL DEFAULT 0,
    issues INT(11) NOT NULL DEFAULT 0,
    score FLOAT(10, 4) NOT NULL
);