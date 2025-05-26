import moment = require('moment-timezone');

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const currentTimestamp = (): number => {
    return Date.now();
};

export const generateRandomNumbers = (lenght: number): number => {
    return Math.ceil(Math.random() * 10 ** lenght);
};
