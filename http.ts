export interface HttpResult<T = unknown> {
    status: number;
    data?: T;
}

export type HttpConvert<T> = (response: Response) => Promise<T>;

export interface Http {
    setBaseUrl(baseUrl: string): void;
    setAuth(auth: string): void;
    setTimeout(timeout: number): void;
    get<T = unknown>(path: string, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>>;
    put<T = unknown>(path: string, body: BodyInit, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>>;
    post<T = unknown>(path: string, body: BodyInit, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>>;
    del<T = unknown>(path: string, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>>;
}

const mergeHeaders = (baseHeaders: Headers, headers?: Record<string, string>): Headers => {
    const merged = new Headers(baseHeaders);

    for (const [key, value] of Object.entries(headers ?? {})) {
        merged.set(key, value);
    }

    return merged;
};

type RequestTimeout = {
    signal?: AbortSignal;
    clear(): void;
};

const createRequestTimeout = (timeout: number): RequestTimeout => {
    if (timeout <= 0) return { clear: () => undefined };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return {
        signal: controller.signal,
        clear: () => clearTimeout(timer),
    };
};

const defaultConverter: HttpConvert<unknown> = async (response: Response): Promise<unknown> => response.json();

const request = async <T>(
    method: "GET" | "PUT" | "POST" | "DELETE",
    baseUrl: string,
    baseHeaders: Headers,
    path: string,
    body?: BodyInit,
    headers?: Record<string, string>,
    timeout?: number,
    converter: HttpConvert<T> = defaultConverter as HttpConvert<T>,
): Promise<HttpResult<T>> => {
    const requestUrl: URL = new URL(path, baseUrl);
    const timeoutControl = createRequestTimeout(timeout ?? 0);

    try {
        const response = await fetch(requestUrl.toString(), {
            method,
            headers: mergeHeaders(baseHeaders, headers),
            body,
            signal: timeoutControl.signal,
        });

        if (response.status !== 200) {
            return { status: response.status };
        }

        return {
            status: 200,
            data: await converter(response),
        };
    } catch {
        if (timeoutControl.signal?.aborted) return { status: 408 };
        return { status: 0 };
    } finally {
        timeoutControl.clear();
    }
};

export const createHttp = (baseUrl: string, headers?: Headers): Http => {
    const state = {
        baseUrl,
        headers: headers || new Headers(),
        timeout: 0,
    };

    return {
        setBaseUrl(baseUrl: string): void {
            state.baseUrl = baseUrl;
        },
        setAuth(auth: string): void {
            state.headers.set("Authorization", auth);
        },
        setTimeout(timeout: number): void {
            state.timeout = timeout;
        },
        get<T = unknown>(path: string, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>> {
            return request<T>("GET", state.baseUrl, state.headers, path, undefined, headers, state.timeout, converter);
        },
        put<T = unknown>(path: string, body: BodyInit, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>> {
            return request<T>("PUT", state.baseUrl, state.headers, path, body, headers, state.timeout, converter);
        },
        post<T = unknown>(path: string, body: BodyInit, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>> {
            return request<T>("POST", state.baseUrl, state.headers, path, body, headers, state.timeout, converter);
        },
        del<T = unknown>(path: string, headers?: Record<string, string>, converter?: HttpConvert<T>): Promise<HttpResult<T>> {
            return request<T>("DELETE", state.baseUrl, state.headers, path, undefined, headers, state.timeout, converter);
        },
    };
};
