WITH t AS (
    SELECT
        gu.id,
        CASE
            WHEN gu.organization IN (
                '-', 'none', 'nope', 'n/a', 'no', 'nil', 'null', 'nothing', 'home', 'FREE', 'Retired', 'Me', 'Myself',
                'Private', 'Self employed', 'Student', 'school', 'NO COMPANY', '无', 'self', 'own',
                'Personal', 'Individual', 'Freelancer', 'Freelance', 'developer'
            ) THEN 'Independent'
            ELSE TRIM(
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(gu.organization, ',', ''), '-', ''), '@', ''), 'www.', ''), 'ltd', ''), 'inc', ''), '.com', ''), 'corporation', ''), '.', '')
            )
            END AS organization_formatted
    FROM github_users gu
    WHERE
        gu.organization IS NOT NULL
        AND LENGTH(gu.organization) BETWEEN 1 AND 128
        AND gu.updated_at >= :from AND gu.updated_at < :to
)
UPDATE github_users gu
JOIN t ON gu.id = t.id
SET gu.organization_formatted = t.organization_formatted
WHERE 1 = 1;
