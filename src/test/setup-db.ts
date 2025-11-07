import { beforeEach, afterEach, vi } from "vitest";

// When integration tests are performed, setup db test connection string

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
