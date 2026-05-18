export const clone = <T>(source: T): T => {
    if (Array.isArray(source)) return source.map((item) => clone(item)) as T;
    if (source instanceof Date) return new Date(source.getTime()) as T;
    if (typeof source !== "object" || source === null) return source;
    return Object.getOwnPropertyNames(source).reduce(
        (obj, prop) => {
            Object.defineProperty(obj, prop, Object.getOwnPropertyDescriptor(source, prop)!);
            obj[prop] = clone((source as Record<string, unknown>)[prop]);
            return obj;
        },
        Object.create(Object.getPrototypeOf(source)),
    ) as T;
};
