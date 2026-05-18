const PHONE_RE = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
const SMS_CODE_RE = /^\d{6}$/;

export const matchPhone = (str: string): boolean => PHONE_RE.test(str);
export const matchSmsCode = (str: string): boolean => SMS_CODE_RE.test(str);
