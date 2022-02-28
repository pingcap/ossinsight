import {Octokit} from "octokit";

export function getGitHubClient() {
  return new Octokit();
}
