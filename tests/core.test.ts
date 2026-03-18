import { describe, it, expect } from "vitest";
import { Openherd } from "../src/core.js";
describe("Openherd", () => {
  it("init", () => { expect(new Openherd().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Openherd(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Openherd(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
