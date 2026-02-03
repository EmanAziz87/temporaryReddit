import type { Response } from "supertest";
import { expect } from "vitest";

export const checkSession = (response: Response) => {
  expect(response.header["set-cookie"]).toBeDefined();
  const cookies = response.headers["set-cookie"];

  if (Array.isArray(cookies)) {
    const sessionExists: boolean = cookies.some((cookie) =>
      cookie.startsWith("user-session"),
    );
    expect(sessionExists).toBe(true);
  } else {
    expect.fail("Set-Cookie header was not returned as an array or missing");
  }
};
