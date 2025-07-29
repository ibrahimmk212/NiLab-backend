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
// export const sendOtp = async (email: string, otp: number, expire: number) => {
//     const expirationTime = Date.now() + expire * 60 * 1000;

//     // Store OTP in memory
//     otpStorage.set(email, { otp, expirationTime });

//     // Generate email message from template
//     const mail = await emails.sendOtp({
//         otp: otp,
//         email: email,
//         expire: expire
//     });

//     // send the mail
//     sendMail(mail);
// };
