const PHONE_RE = /(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}/;
const SMS_CODE_RE = /\d{6}/;

export const isPhone = (str: string): boolean => /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(str);
export const matchPhone = (str: string): string | null => str.match(PHONE_RE)?.[0] ?? null;

export const isSmsCode = (str: string): boolean => /^\d{6}$/.test(str);
export const matchSmsCode = (str: string): string | null => str.match(SMS_CODE_RE)?.[0] ?? null;
