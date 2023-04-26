---
title: 'Step 1: Get TiDB connection info'
sidebar_position: 1
---

1. Register for a TiDB Cloud account at https://tidbcloud.com/signup.
2. Create a serverless cluster in the TiDB Cloud dashboard.
3. Navigate to the cluster details and locate the connection information (Host, Port, User, and Password).
4. Construct the DATABASE_URL in the following format: `mysql2://user:password@host:port/database_name`. Make sure to replace user, password, host, port(default: 4000), and database_name with your actual connection details.