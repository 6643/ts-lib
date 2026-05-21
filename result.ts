export type Result<T = void> = T | Error;

type PromisePart<T> = Extract<T, PromiseLike<unknown>>;
type SyncPart<T> = Exclude<T, PromiseLike<unknown>>;
type ResultFromFunction<T> = [PromisePart<T>] extends [never]
    ? Result<T>
    : [SyncPart<T>] extends [never]
      ? Promise<Result<Awaited<T>>>
      : Result<SyncPart<T>> | Promise<Result<Awaited<T>>>;

type ResultFn = {
    <T>(fn: () => T): ResultFromFunction<T>;
    <T>(fn: () => PromiseLike<T>): Promise<Result<T>>;
    <T>(promise: PromiseLike<T>): Promise<Result<T>>;
};

const fromPromise = async <T>(promise: PromiseLike<T>): Promise<Result<Awaited<T>>> => {
    try {
        return toResult(await promise);
    } catch (error) {
        return newError(error);
    }
};

const isPromiseLike = <T>(value: unknown): value is PromiseLike<T> => {
    const type = typeof value;
    if ((type !== "object" && type !== "function") || value === null) return false;
    return typeof (value as { readonly then?: unknown }).then === "function";
};

export const isError = (error: unknown): error is Error => {
    return error instanceof Error;
};

const stringifyError = (error: unknown): string => {
    try {
        return String(error);
    } catch {
        return "Unknown error";
    }
};

const newError = (error: unknown): Error => {
    if (isError(error)) return error;
    return new Error(stringifyError(error));
};

const toResult = <T>(value: T): Result<T> => {
    return isError(value) ? newError(value) : value;
};

export const tryResult = (<T>(target: (() => T) | PromiseLike<T>): Result<T> | Promise<Result<Awaited<T>>> => {
    if (typeof target !== "function") return fromPromise(target);

    try {
        const value = target();
        return isPromiseLike<Awaited<T>>(value) ? fromPromise(value) : toResult(value);
    } catch (error) {
        return newError(error);
    }
}) as ResultFn;
