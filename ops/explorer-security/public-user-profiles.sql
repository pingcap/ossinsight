CREATE SQL SECURITY DEFINER VIEW explorer_public_github_users AS
SELECT id, login, type, name, organization, country_code, followers, followings, created_at, updated_at
FROM github_users;
