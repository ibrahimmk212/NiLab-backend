"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfig = {
    app: {
        name: process.env.APP_NAME,
        server: process.env.SERVER,
        isDevelopment: ['development', 'dev', 'local'].includes(process.env.SERVER),
        port: parseInt(process.env.PORT, 10) || 3000,
        apiVersion: process.env.API_VERSION || 'v1',
        secret: process.env.SECRET || 'j!89nKO5as&Js',
        tempSecret: process.env.TEMP_SECRET || 'dlu93hccu!&Hg0',
        hashSalt: parseInt(process.env.HASH_SALT, 10) || 10,
        jwtExpire: process.env.JWT_EXPIRE || '1d',
        maxFileSize: parseInt(process.env.MAX_FILE_UPLOAD, 10),
        defaultNearbyDistance: parseInt(process.env.DEFAULT_NEARBY_DISTANCE) || 1000
    },
    aws: {
        awsKey: process.env.AWS_ACCESS_KEY_ID,
        awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
        awsBucket: process.env.S3_BUCKET,
        awsRegion: process.env.S3_REGION
    },
    db: {
        mongo_url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/nilab_market'
    },
    monnify: {
        baseUrl: process.env.MONNIFY_API_URL,
        monnifyApiKey: process.env.MONNIFY_API_KEY,
        monnifySecretKey: process.env.MONNIFY_SECRET_KEY,
        accessToken: '',
        contractCode: process.env.CONTRACT_CODE,
        walletNumber: process.env.WALLET_NUMBER
    }
};
exports.default = Object.freeze(AppConfig);
