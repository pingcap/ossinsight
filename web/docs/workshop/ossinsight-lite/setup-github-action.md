---
title: 'Step 2: Setup GitHub Action'
sidebar_position: 3
---

1. Fork the repo-track-pipeline repository to your GitHub account.
2. Enable GitHub Actions for your forked repository by navigating to the "Actions" tab and clicking on I understand my workflows, go ahead and enable them.
![](/img/workshop/enable-github-action.png)
1. Navigate to the Settings -> Secrets tab of your forked repository.
2. Add the following secrets:
- ACCESS_TOKEN: Your GitHub Personal Access Token from Step 1
- DATABASE_URL: The TiDB Cloud MySQL connection information in URI format from Step 2
- REPO_FULL_NAME: The full name of the repository you want to track (e.g., owner/repo-name)
![](/img/workshop/add-secrets.png)
1. Navigate to the "Actions" tab of your forked repo on GitHub.
2. On the left side, click on "Sync GitHub Repo Data" workflow.
3. Click the Run workflow dropdown button located on the right side of the interface.
4. Select the main branch and click on Run workflow.
![](/img/workshop/run-workflow.png)
1. The GitHub Action will execute, syncing the specified repository data to the TiDB Cloud after a few minutes.
