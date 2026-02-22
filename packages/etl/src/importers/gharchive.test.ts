import { describe, it, expect } from "vitest";
import { parseEvent } from "../importers/gharchive.js";
import type { RawGHEvent } from "../models/github-event.js";

const MINIMAL_EVENT: RawGHEvent = {
  id: "123",
  type: "PushEvent",
  created_at: "2024-01-15T12:00:00Z",
  repo: { id: 456, name: "owner/repo" },
  actor: { id: 789, login: "octocat" },
  payload: {},
};

describe("parseEvent", () => {
  it("maps basic fields correctly", () => {
    const record = parseEvent(MINIMAL_EVENT);
    expect(record.id).toBe(123);
    expect(record.type).toBe("PushEvent");
    expect(record.repo_id).toBe(456);
    expect(record.repo_name).toBe("owner/repo");
    expect(record.actor_id).toBe(789);
    expect(record.actor_login).toBe("octocat");
  });

  it("derives event_day, event_month, event_year from created_at", () => {
    const record = parseEvent(MINIMAL_EVENT);
    expect(record.event_day).toBe("2024-01-15");
    expect(record.event_month).toBe("2024-01-01");
    expect(record.event_year).toBe(2024);
  });

  it("defaults numeric fields to 0 when absent", () => {
    const record = parseEvent(MINIMAL_EVENT);
    expect(record.additions).toBe(0);
    expect(record.deletions).toBe(0);
    expect(record.push_size).toBe(0);
    expect(record.push_distinct_size).toBe(0);
  });

  it("defaults date fields to epoch when absent", () => {
    const EPOCH = new Date("1970-01-01T00:00:00Z");
    const record = parseEvent(MINIMAL_EVENT);
    expect(record.closed_at).toEqual(EPOCH);
    expect(record.pr_merged_at).toEqual(EPOCH);
    expect(record.pr_or_issue_created_at).toEqual(EPOCH);
  });

  it("parses org fields when present", () => {
    const event: RawGHEvent = {
      ...MINIMAL_EVENT,
      org: { id: 99, login: "my-org" },
    };
    const record = parseEvent(event);
    expect(record.org_id).toBe(99);
    expect(record.org_login).toBe("my-org");
  });

  it("extracts PR-specific fields from payload", () => {
    const event: RawGHEvent = {
      ...MINIMAL_EVENT,
      type: "PullRequestEvent",
      payload: {
        action: "closed",
        pull_request: {
          id: 555,
          number: 42,
          state: "closed",
          merged: true,
          additions: 100,
          deletions: 20,
          changed_files: 5,
          review_comments: 3,
          merged_at: "2024-01-15T13:00:00Z",
          closed_at: "2024-01-15T13:00:00Z",
          comments: 7,
          user: { login: "prauthor", id: 111 },
          base: { repo: { language: "TypeScript" } },
          created_at: "2024-01-14T09:00:00Z",
        },
      },
    };
    const record = parseEvent(event);
    expect(record.action).toBe("closed");
    expect(record.pr_merged).toBe(true);
    expect(record.additions).toBe(100);
    expect(record.deletions).toBe(20);
    expect(record.pr_changed_files).toBe(5);
    expect(record.pr_review_comments).toBe(3);
    expect(record.language).toBe("TypeScript");
    expect(record.creator_user_login).toBe("prauthor");
    expect(record.creator_user_id).toBe(111);
    expect(record.number).toBe(42);
    expect(record.pr_or_issue_id).toBe(555);
  });

  it("extracts issue-specific fields from payload", () => {
    const event: RawGHEvent = {
      ...MINIMAL_EVENT,
      type: "IssuesEvent",
      payload: {
        action: "opened",
        issue: {
          id: 777,
          number: 10,
          state: "open",
          comments: 2,
          user: { login: "issueauthor", id: 222 },
          created_at: "2024-01-15T10:00:00Z",
          closed_at: null,
        },
      },
    };
    const record = parseEvent(event);
    expect(record.action).toBe("opened");
    expect(record.state).toBe("open");
    expect(record.number).toBe(10);
    expect(record.pr_or_issue_id).toBe(777);
    expect(record.creator_user_login).toBe("issueauthor");
  });
});
