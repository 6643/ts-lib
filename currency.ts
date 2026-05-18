export const moneyToInt = (value: string): number => Math.trunc((parseFloat(value) || 0) * 100)
export const moneyToString = (value: number): string => (value / 100).toFixed(2)

