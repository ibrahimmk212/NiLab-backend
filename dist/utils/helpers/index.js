"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumbers = exports.currentTimestamp = exports.slugify = void 0;
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
exports.slugify = slugify;
const currentTimestamp = () => {
    return Date.now();
};
exports.currentTimestamp = currentTimestamp;
const generateRandomNumbers = (lenght) => {
    return Math.ceil(Math.random() * 10 ** lenght);
};
exports.generateRandomNumbers = generateRandomNumbers;
