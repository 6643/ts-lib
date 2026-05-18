import { expect, test } from "bun:test";
import { createHttp } from "./http";

test("createHttp exposes get put post del and setTimeout", () => {
    const http = createHttp("https://example.com");
    expect(typeof http.get).toBe("function");
    expect(typeof http.put).toBe("function");
    expect(typeof http.post).toBe("function");
    expect(typeof http.del).toBe("function");
    expect(typeof http.setTimeout).toBe("function");
});

test("request wraps successful json responses with status and data", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => Response.json({ ok: true, count: 3 })) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        const result = await http.get<{ ok: boolean; count: number }>("/status");

        expect(result).toEqual({ status: 200, data: { ok: true, count: 3 } });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("request omits data for non-200 responses", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => Response.json({ error: "missing" }, { status: 404 })) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        const result = await http.get("/missing");

        expect(result).toEqual({ status: 404 });
        expect(result).not.toHaveProperty("data");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("request maps fetch failures to status 0", async () => {
    const originalFetch = globalThis.fetch;
    const expectedError = new Error("network unavailable");

    globalThis.fetch = (async () => {
        throw expectedError;
    }) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        await expect(http.get("/status")).resolves.toEqual({ status: 0 });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("request maps slow requests to status 408", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_path: string | URL, init?: RequestInit) => {
        await new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        });
        return Response.json({ ok: true });
    }) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        http.setTimeout(1);
        await expect(http.get("/slow")).resolves.toEqual({ status: 408 });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("request uses a custom converter when provided", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("plain text", { status: 200 })) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        const result = await http.get<string>("/text", undefined, async (response) => response.text());

        expect(result).toEqual({ status: 200, data: "plain text" });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("post and del return wrapped results and preserve fetch methods", async () => {
    const calls: Array<{ method: string; body: unknown }> = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_path: string | URL, init?: RequestInit) => {
        calls.push({ method: String(init?.method), body: init?.body });
        return Response.json({ ok: true, count: 3 });
    }) as typeof fetch;

    try {
        const http = createHttp("https://example.com");
        const postResult = await http.post<{ ok: boolean; count: number }>("/post", new Blob(["x"]));
        const delResult = await http.del<{ ok: boolean; count: number }>("/del");

        expect(postResult).toEqual({ status: 200, data: { ok: true, count: 3 } });
        expect(delResult).toEqual({ status: 200, data: { ok: true, count: 3 } });
        expect(calls[0]?.method).toBe("POST");
        expect(calls[1]?.method).toBe("DELETE");
    } finally {
        globalThis.fetch = originalFetch;
    }
});
