import { expect, test } from "bun:test";
import { err, tryAsyncResult, trySyncResult } from "./result";

test("err preserves non-Error payloads", () => {
    expect(err("boom")).toEqual({ ok: false, error: "boom" });
    expect(err({ code: 500 })).toEqual({ ok: false, error: { code: 500 } });
});

test("trySyncResult normalizes thrown values to Error", () => {
    const result = trySyncResult(() => {
        throw "boom";
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe("boom");
});

test("tryAsyncResult normalizes rejected values to Error", async () => {
    const result = await tryAsyncResult(() => Promise.reject("boom"));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe("boom");
});
