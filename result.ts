export type Result<T = void> = T | Error;

type PromisePart<T> = Extract<T, Promise<unknown>>;
type SyncPart<T> = Exclude<T, Promise<unknown>>;
type ResultFromFunction<T> = [PromisePart<T>] extends [never]
    ? Result<T>
    : [SyncPart<T>] extends [never]
      ? Promise<Result<Awaited<PromisePart<T>>>>
      : Result<SyncPart<T>> | Promise<Result<Awaited<PromisePart<T>>>>;

type ResultFn = {
    <T>(fn: () => T): ResultFromFunction<T>;
    <T>(fn: () => Promise<T>): Promise<Result<Awaited<T>>>;
    <T>(promise: Promise<T>): Promise<Result<Awaited<T>>>;
};

const fromPromise = async <T>(promise: Promise<T>): Promise<Result<Awaited<T>>> => {
    try {
        return await promise;
    } catch (error) {
        return newError(error);
    }
};

const isPromise = <T>(value: unknown): value is Promise<T> => {
    return value instanceof Promise;
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

export const tryResult = (<T>(target: (() => T) | Promise<T>): Result<T> | Promise<Result<Awaited<T>>> => {
    if (typeof target !== "function") return fromPromise(target);

    try {
        const value = target();
        return isPromise<Awaited<T>>(value) ? fromPromise(value) : value;
    } catch (error) {
        return newError(error);
    }
}) as ResultFn;
