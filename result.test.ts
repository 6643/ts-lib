import { expect, test } from "bun:test";
import { err, isErr, isOk, ok, tryAsyncResult, trySyncResult } from "./result";

test("ok creates Ok values and guards narrow Result variants", () => {
    const success = ok(1);
    const failure = err("boom");

    expect(success).toEqual({ ok: true, value: 1 });
    expect(isOk(success)).toBe(true);
    expect(isErr(success)).toBe(false);
    expect(isOk(failure)).toBe(false);
    expect(isErr(failure)).toBe(true);
});

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

test("trySyncResult does not rethrow when thrown object has unsafe message getter", () => {
    const payload = {};
    Object.defineProperty(payload, "message", {
        get() {
            throw new Error("message getter failed");
        },
    });

    const result = trySyncResult(() => {
        throw payload;
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
});

test("tryAsyncResult does not rethrow when rejection object has unsafe message getter", async () => {
    const payload = {};
    Object.defineProperty(payload, "message", {
        get() {
            throw new Error("message getter failed");
        },
    });

    const result = await tryAsyncResult(() => Promise.reject(payload));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
});

test("trySyncResult does not rethrow when thrown object cannot be stringified", () => {
    const payload: Record<string, unknown> = {};
    payload.self = payload;
    Object.defineProperty(payload, "toString", {
        value() {
            throw new Error("toString failed");
        },
    });

    const result = trySyncResult(() => {
        throw payload;
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
});

test("tryAsyncResult does not rethrow when rejection object cannot be stringified", async () => {
    const payload: Record<string, unknown> = {};
    payload.self = payload;
    Object.defineProperty(payload, "toString", {
        value() {
            throw new Error("toString failed");
        },
    });

    const result = await tryAsyncResult(() => Promise.reject(payload));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
});

test("trySyncResult does not rethrow when thrown value breaks instanceof checks", () => {
    const payload = new Proxy(
        {},
        {
            getPrototypeOf() {
                throw new Error("prototype failed");
            },
        },
    );

    const result = trySyncResult(() => {
        throw payload;
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(Error);
});

test("trySyncResult does not rethrow when global Error constructor is replaced", () => {
    const nativeError = globalThis.Error;
    globalThis.Error = function ThrowingError() {
        throw nativeError("Error constructor failed");
    } as unknown as ErrorConstructor;

    try {
        const result = trySyncResult(() => {
            throw "boom";
        });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toBeInstanceOf(nativeError);
    } finally {
        globalThis.Error = nativeError;
    }
});

test("trySyncResult does not rethrow when global String returns a non-string", () => {
    const nativeString = globalThis.String;
    globalThis.String = function NonString() {
        return Symbol("not string") as unknown as string;
    } as unknown as StringConstructor;

    try {
        const result = trySyncResult(() => {
            throw 1;
        });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toBeInstanceOf(Error);
    } finally {
        globalThis.String = nativeString;
    }
});
