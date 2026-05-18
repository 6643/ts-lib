export const timeToString = (date: number, timeZone: string | undefined = undefined): string => {
    if (!Number.isFinite(date) || Math.abs(date) > 8.64e15) return "NaN";

    const targetDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { hour12: false, timeZone: timeZone || undefined };
    return targetDate.toLocaleString("sv-SE", options).replace("T", " ");
};

export type TimeParts = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export const toTime = (num: number): TimeParts => {
    return {
        days: Math.floor(num / (60 * 60 * 24)),
        hours: Math.floor((num % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((num % (60 * 60)) / 60),
        seconds: Math.floor(num % 60),
    };
};

export const dateToNum = (date: Date = new Date()): number => {
    return Math.trunc(date.getTime() / 1000);
};

export const sleep = async (ms: number): Promise<number> => {
    return new Promise<number>((resolve) => setTimeout(() => resolve(ms), ms));
};

export const timeSince = (time: number): number => {
    return Math.trunc(Date.now() / 1000) - time;
};

export const tickToString = (num: number): string => {
    if (!Number.isFinite(num) || num < 0) return "";
    if (num < 24 * 60) {
        const hour = Math.floor(num / 60).toString();
        const minute = Math.floor(num % 60).toString();
        return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    }
    const time = new Date(num * 60 * 1000);

    const [month, day, hour, minute] = [
        (time.getMonth() + 1).toString().padStart(2, "0"),
        time.getDate().toString().padStart(2, "0"),
        time.getHours().toString().padStart(2, "0"),
        time.getMinutes().toString().padStart(2, "0"),
    ];

    return `${month}-${day} ${hour}:${minute}`;
};

const TIME_TICK_RE = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
const DAY_TIME_TICK_RE = /^(\d+)\s+([0-1]\d|2[0-3]):([0-5]\d)$/;
export const tickFromString = (str: string): number => {
    const sameDay = str.match(TIME_TICK_RE);
    if (sameDay?.[1] != null && sameDay?.[2] != null) {
        return Number.parseInt(sameDay[1], 10) * 60 + Number.parseInt(sameDay[2], 10);
    }

    const dayTime = str.match(DAY_TIME_TICK_RE);
    if (dayTime?.[1] == null || dayTime?.[2] == null || dayTime?.[3] == null) return Number.NaN;

    const day = Number.parseInt(dayTime[1], 10);
    const hour = Number.parseInt(dayTime[2], 10);
    const minute = Number.parseInt(dayTime[3], 10);
    const time = new Date();

    time.setHours(hour, minute, 0, 0);

    return Math.floor(time.getTime() / 1000 / 60) + day * 24 * 60;
};
