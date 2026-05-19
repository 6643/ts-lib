export interface Ok<T> {
    readonly ok: true;
    readonly value: T;
}

export interface Err<E = Error> {
    readonly ok: false;
    readonly error: E;
}

export type Result<T, E = Error> = Ok<T> | Err<E>;

const NativeError = Error;
const NativeString = String;

const toError = (error: unknown): Error => {
    if (isError(error)) return error;
    const message = getStringMessage(error);
    if (message !== undefined) return new NativeError(message);
    if (isObjectLike(error)) return new NativeError(formatObjectError(error));
    return new NativeError(typeof error === "string" ? error : safeString(error));
};

const isError = (value: unknown): value is Error => {
    try {
        return value instanceof NativeError;
    } catch {
        return false;
    }
};

const getStringMessage = (value: unknown): string | undefined => {
    if (!isObjectLike(value)) return undefined;
    try {
        const message = value.message;
        return typeof message === "string" ? message : undefined;
    } catch {
        return undefined;
    }
};

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const formatObjectError = (value: Record<string, unknown>): string => {
    try {
        const serialized = JSON.stringify(value);
        return serialized ?? safeString(value);
    } catch {
        return safeString(value);
    }
};

const safeString = (value: unknown): string => {
    try {
        const text = NativeString(value);
        return typeof text === "string" ? text : "[unknown error]";
    } catch {
        return "[unknown error]";
    }
};

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok;

export const trySyncResult = <T>(fn: () => T): Result<T> => {
    try {
        return ok(fn());
    } catch (error) {
        return err(toError(error));
    }
};

type Thenable<T> = {
    then: (resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) => unknown;
};
export const tryAsyncResult = async <T>(fn: () => T | Thenable<T>): Promise<Result<T>> => {
    try {
        return ok(await Promise.resolve(fn()));
    } catch (error) {
        return err(toError(error));
    }
};
