export const listRemove = <T>(list: T[], index: number): T[] => {
    if (!Number.isSafeInteger(index)) return list;
    const resolved = index < 0 ? list.length + index : index;
    if (resolved >= 0 && resolved < list.length) list.splice(resolved, 1);

    return list;
};

export const listSwap = <T>(list: T[], aIndex: number, bIndex: number): T[] => {
    if (!listCanSwap(list.length, aIndex, bIndex)) return list;
    const [a, b] = [list[aIndex] as T, list[bIndex] as T];
    list[aIndex] = b;
    list[bIndex] = a;
    return list;
};

export const listCanSwap = (len: number, aIndex: number, bIndex: number): boolean => {
    if (len < 2 || !Number.isSafeInteger(aIndex) || !Number.isSafeInteger(bIndex) || aIndex == bIndex) return false;
    return aIndex > -1 && aIndex < len && bIndex > -1 && bIndex < len;
};

export const listFromString = (text: string): string[] => text.split(",").map((text): string => text.trim());
