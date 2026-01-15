import moment = require('moment-timezone');
const otpStorage = new Map();

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

export const generatePromotionCode = (keyLength = 8): string => {
    let i: number,
        key = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const charactersLength = characters.length;

    for (i = 0; i < keyLength; i++) {
        key += characters.substr(
            Math.floor(Math.random() * charactersLength + 1),
            1
        );
    }

    return key;
};

export const calculateStraightDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
