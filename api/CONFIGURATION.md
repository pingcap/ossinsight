# Configuration

# Allowed origins

If you want to call the OSSInsight API directly on the front end of your website, you can add the domain name of your website to the configuration file named [allowed-origins.yaml](/api/allowed-origins.yaml) to avoid CORS problems.

For example:

```yaml
private_origins:
  # Production.
  - ^https://ossinsight\.io/$
  - ^https://live\.ossinsight\.io/$
public_origins:
  # External Users.
  - ^https://github1s\.com/$
```

# Bots

In some queries, we need to filter out some robots to avoid data noise. We use the `is_bot` field of the `github_users` table to identify whether a GitHub user is a bot. These bots are not necessarily GitHub App (login ends with `[bot]`), and may also be operated by ordinary users' access tokens.

You can add GitHub logins of these robots or RegExp that can match multiple robot logins in the [bots.yaml](/api//bots.yaml) file.

For example:

```yaml
bot_github_logins:
  - "/^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$/"
  - "web-flow"
```

The script will update the `is_bot` field according to the configuration file.

Then you can filter out the robot account in the query by a SQL statement like the following:

```sql
SELECT *
FROM github_events ge
JOIN github_users gu ON ge.actor_login = gu.login AND gu.is_bot = 0
LIMIT 10
``` 

# Organizations

We store organizational information through yaml config file named [organizations.yaml](/api/organizations.yaml) so that users can make changes by submitting PRs.

For example:

```yaml
organizations:
  # Individual
  - name: Individual
    type: IND
    patterns:
      - Freelancer
      - Freelance
  # Foundation
  - name: Linux Foundation
    full_name: The Linux Foundation
    type: FDN
    patterns:
      - ^\s*(linux\sfoundation|linux\.?com|the\slinux\sfoundation,?\stungsten\sfabric)\s*$
    domains:
      - linux-foundation.org
      - linuxfoundation.org
      - osdl.org
```

- The `name` field, the name of the organization, needs to be as short as possible.
- The `full_name` field, standard full name of the organization, can be empty.
- The `type` field, we divide organizations into the following types:
  - `IND`: Individual, does not belong to any organization.
  - `FDN`: Foundation, may be a non-profit organization, it may be a composite group of several companies.
  - `COM`: Company.
  - `EDU`: Educational institution, may be a university.
  - `N/A`: Unknown.
- The `patterns` array filed, here you can add RegExp that match the current organization name.
- The `domains` array field, you can add a domain name owned by the organization. If a user uses an email suffixed with this domain name as a public email address, he will be considered a member of this company or organization. For example: `linuxfoundation.org`
