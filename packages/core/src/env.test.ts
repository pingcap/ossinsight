import { describe, it, expect } from "vitest";
import { baseEnvSchema } from "./env";

interface StringProp {
  type: string;
  separator?: string;
  default?: string;
}

describe("baseEnvSchema", () => {
  it("requires DATABASE_URL", () => {
    expect(baseEnvSchema.required).toContain("DATABASE_URL");
  });

  it("has optional GITHUB_ACCESS_TOKENS with comma separator", () => {
    const prop = baseEnvSchema.properties.GITHUB_ACCESS_TOKENS as StringProp;
    expect(prop.type).toBe("string");
    expect(prop.separator).toBe(",");
  });

  it("has LOG_LEVEL with default info", () => {
    const prop = baseEnvSchema.properties.LOG_LEVEL as StringProp;
    expect(prop.type).toBe("string");
    expect(prop.default).toBe("info");
  });
});
