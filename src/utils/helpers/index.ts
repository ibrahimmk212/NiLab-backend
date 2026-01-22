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

export const generateRandomNumbers = (length: number = 10): number => {
    const min = 10 ** (length - 1); // Smallest number with 'length' digits (e.g., 100 for 3)
    const max = 10 ** length - 1; // Largest number with 'length' digits (e.g., 999 for 3)

    // Generate random integer in the inclusive range [min, max]
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

// export const calculateStraightDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
// ) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * (Math.PI / 180)) *
//             Math.cos(lat2 * (Math.PI / 180)) *
//             Math.sin(dLon / 2) *
//             Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// };

type LatLng = {
    latitude: number;
    longitude: number;
};

export function calculateStraightDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
    const p = 0.017453292519943295; // Math.PI / 180
    const a =
        0.5 -
        Math.cos((lat2 - lat1) * p) / 2 +
        (Math.cos(lat1 * p) *
            Math.cos(lat2 * p) *
            (1 - Math.cos((lon2 - lon1) * p))) /
            2;

    return 12742 * Math.asin(Math.sqrt(a)); // Distance in kilometers
}
