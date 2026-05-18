export const reduce = <T, R>(arr: T[], reducer: (accumulator: R, current: T) => R, initialValue: R): R => {
    let acc = initialValue;
    for (let i = 0; i < arr.length; i++) {
        acc = reducer(acc, arr[i] as T);
    }
    return acc;
};
