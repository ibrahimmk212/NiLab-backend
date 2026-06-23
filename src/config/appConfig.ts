const AppConfig = {
    app: {
        name: process.env.APP_NAME,
        server: process.env.SERVER,
        isDevelopment: ['development', 'dev', 'local'].includes(
            <string>process.env.SERVER
        ),
        port: parseInt(<string>process.env.PORT, 10) || 3000,
        apiVersion: process.env.API_VERSION || 'v1',
        secret: process.env.SECRET || 'j!89nKO5as&Js',
        tempSecret: process.env.TEMP_SECRET || 'dlu93hccu!&Hg0',
        hashSalt: parseInt(<string>process.env.HASH_SALT, 10) || 10,
        jwtExpire: process.env.JWT_EXPIRE || '1d',
        maxFileSize: parseInt(<string>process.env.MAX_FILE_UPLOAD, 10),
        defaultNearbyDistance:
            parseInt(<string>process.env.DEFAULT_NEARBY_DISTANCE) || 1000,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    // aws: {
    //     awsKey: process.env.AWS_ACCESS_KEY_ID,
    //     awsSecret: process.env.AWS_SECRET_ACCESS_KEY as string,
    //     awsBucket: process.env.S3_BUCKET,
    //     awsRegion: process.env.S3_REGION
    // },
    db: {
        mongo_url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mds-food'
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY as string,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY as string,
        redirectUrl: 'https://dashboard.terminusdrive.com/checkout/success'
    },
    mailer: {
        service: process.env.SMTP_SERVICE,
        port: process.env.EMAIL_PORT,

        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,

        fromName: process.env.FROM_NAME,
        fromEmail: process.env.EMAIL_FROM
    },
    corsWhiteList: ['*']
    // corsWhiteList: (process.env.CORS_WHITELIST as string) || ''
};

export default Object.freeze(AppConfig);
