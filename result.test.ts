import { expect, test } from "bun:test";
import * as result from "./result";

test("result module has no function declarations or expressions", async () => {
    const source = await Bun.file("result.ts").text();

    expect(source).not.toMatch(/\bfunction\b\s*(?:[\w$]+\s*)?(?:<[^;{=]*>\s*)?\(/);
});

test("result module exposes only the public result helpers", () => {
    expect(typeof result.tryResult).toBe("function");
    expect(typeof result.isError).toBe("function");
    expect("isOk" in result).toBe(false);
    expect("isErr" in result).toBe(false);
    expect("toOk" in result).toBe(false);
    expect("toErr" in result).toBe(false);
});

test("Result is a value-or-Error union", () => {
    const success: result.Result<number> = 1;
    const failure: result.Result<number> = new Error("boom");
    const errorLike: result.Result<{ readonly name: string; readonly message: string; readonly code: number }> = {
        name: "BusinessError",
        message: "ok",
        code: 1,
    };

    expect(success).toBe(1);
    expect(failure).toBeInstanceOf(Error);
    expect(errorLike.code).toBe(1);
});

test("result treats returned Error values as failures", async () => {
    const syncPayload = new Error("sync");
    const promisePayload = new Error("promise");
    const mixedPayload = new Error("mixed");

    const syncValue = result.tryResult(() => syncPayload);
    const promiseValue = await result.tryResult((): Promise<Error> => Promise.resolve(promisePayload));
    const mixedValue = await result.tryResult((): Promise<Error> | number => Promise.resolve(mixedPayload));

    expect(syncValue).toBe(syncPayload);
    expect(promiseValue).toBe(promisePayload);
    expect(mixedValue).toBe(mixedPayload);
    expect(syncValue).toBeInstanceOf(Error);
    expect(promiseValue).toBeInstanceOf(Error);
    expect(mixedValue).toBeInstanceOf(Error);
    if (!result.isError(syncValue) || !result.isError(promiseValue) || !result.isError(mixedValue)) return;
    expect(syncValue.message).toBe("sync");
    expect(promiseValue.message).toBe("promise");
    expect(mixedValue.message).toBe("mixed");
});

test("isError narrows Result failures", () => {
    const value: result.Result<number> = Math.random() > 0.5 ? 1 : new Error("boom");

    if (result.isError(value)) {
        const failure: Error = value;
        void failure;
        return;
    }

    const success: number = value;
    void success;
});

test("result returns value for successful sync functions", () => {
    const value = result.tryResult(() => 1);

    expect(value).toBe(1);
});

test("result converts non-Error sync failures to Error", () => {
    const value = result.tryResult<number>(() => {
        throw "boom";
    });

    expect(value).toBeInstanceOf(Error);
    if (!result.isError(value)) return;
    expect(value.message).toBe("boom");
});

test("result normalizes nullish thrown values to Error", () => {
    const value = result.tryResult(() => {
        throw null;
    });

    expect(value).toBeInstanceOf(Error);
    if (!result.isError(value)) return;
    expect(value.message).toBe("null");
});

test("result wraps fulfilled promises", async () => {
    const value = await result.tryResult(Promise.resolve(1));

    expect(value).toBe(1);
});

test("result wraps rejected promises", async () => {
    const payload = new Error("boom");
    const value = await result.tryResult<number>(Promise.reject(payload));

    expect(value).toBe(payload);
    expect(value).toBeInstanceOf(Error);
    if (!result.isError(value)) return;
    expect(value.message).toBe("boom");
});

test("result converts non-Error rejected values to Error", async () => {
    const value = await result.tryResult<number>(Promise.reject("boom"));

    expect(value).toBeInstanceOf(Error);
    if (!result.isError(value)) return;
    expect(value.message).toBe("boom");
});

test("result awaits async function results and catches rejection", async () => {
    const success = await result.tryResult(async () => 1);
    const failure = await result.tryResult<number>(async () => {
        throw "boom";
    });

    expect(success).toBe(1);
    expect(failure).toBeInstanceOf(Error);
    if (!result.isError(failure)) return;
    expect(failure.message).toBe("boom");
});

test("result awaits native Promise results returned from callbacks", async () => {
    const value = await result.tryResult((): Promise<number> => Promise.resolve(2));

    expect(value).toBe(2);
});

test("result treats custom thenables returned from callbacks as sync values", () => {
    const payload = {
        then<TResult1 = number, TResult2 = never>(
            onfulfilled?: ((value: number) => TResult1 | Promise<TResult1>) | null,
            _onrejected?: ((reason: unknown) => TResult2 | Promise<TResult2>) | null,
        ): Promise<TResult1 | TResult2> {
            return Promise.resolve(onfulfilled === undefined || onfulfilled === null ? (2 as TResult1) : onfulfilled(2));
        },
    };

    const value = result.tryResult(() => payload);

    expect(value).toBe(payload);
});

const assertDirectCustomThenablesAreRejected = () => {
    const payload = {
        then<TResult1 = number, TResult2 = never>(
            onfulfilled?: ((value: number) => TResult1 | Promise<TResult1>) | null,
            _onrejected?: ((reason: unknown) => TResult2 | Promise<TResult2>) | null,
        ): Promise<TResult1 | TResult2> {
            return Promise.resolve(onfulfilled === undefined || onfulfilled === null ? (2 as TResult1) : onfulfilled(2));
        },
    };

    // @ts-expect-error direct custom thenables are outside the Promise-only contract.
    void result.tryResult(payload);
};

void assertDirectCustomThenablesAreRejected;

test("result infers awaited values for nested promises", () => {
    const nested = new Promise<Promise<number>>((resolve) => resolve(Promise.resolve(1)));
    const value = result.tryResult(nested);

    const expected: Promise<result.Result<number>> = value;
    // @ts-expect-error nested promises must be flattened by await semantics.
    const unexpected: Promise<result.Result<Promise<number>>> = value;
    void expected;
    void unexpected;
});

test("result treats callable inputs as thunks", () => {
    const payload = Object.assign(() => 1, {
        then<TResult1 = number, TResult2 = never>(
            onfulfilled?: ((value: number) => TResult1 | Promise<TResult1>) | null,
            _onrejected?: ((reason: unknown) => TResult2 | Promise<TResult2>) | null,
        ): Promise<TResult1 | TResult2> {
            return Promise.resolve(onfulfilled === undefined || onfulfilled === null ? (2 as TResult1) : onfulfilled(2));
        },
    });

    const value = result.tryResult(payload);

    expect(value).toBe(1);
});

test("result keeps Promise-or-value inference for mixed callbacks", async () => {
    const out = result.tryResult((): Promise<number> | string => {
        return Math.random() > 0.5 ? Promise.resolve(1) : "ok";
    });

    if (out instanceof Promise) {
        const asyncValue = await out;
        if (result.isError(asyncValue)) return;
        const inferred: number = asyncValue;
        // @ts-expect-error async branch must not include the sync string value.
        const narrowed: string = asyncValue;
        void inferred;
        void narrowed;
        return;
    }

    const value = out;
    if (result.isError(value)) return;
    const inferred: number | string = value;
    // @ts-expect-error mixed success value must not narrow to number.
    const narrowed: number = value;
    void inferred;
    void narrowed;
});
