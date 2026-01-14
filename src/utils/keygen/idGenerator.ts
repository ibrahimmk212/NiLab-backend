// utils/idGenerator.ts
import { customAlphabet } from 'nanoid';

// Using a custom alphabet to remove ambiguous characters (0, O, I, 1, L)
// This makes the ID "cleaner" for users to read over the phone or SMS.
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a clean, alphanumeric reference
 * @param prefix - The prefix for the ID (e.g., ORD, TXN, PAY)
 * @param length - The length of the random part (default 10)
 */
export const generateReference = (
    prefix: 'ORD' | 'TXN' | 'PAY' | 'WL' | 'SETTLE' | 'REV' | 'PKG',
    length = 10
): string => {
    const nanoid = customAlphabet(alphabet, length);
    return `${prefix}-${nanoid()}`;
};

/**
 * For short numeric pickup codes (e.g., 123456)
 */
export const generateShortCode = (): string => {
    const nanoid = customAlphabet('0123456789', 6);
    return nanoid();
};
