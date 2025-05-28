"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteS3Object = exports.uploadFileToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const appConfig_1 = __importDefault(require("../../config/appConfig"));
// Configure AWS credentials (replace 'your-access-key' and 'your-secret-key' with your actual credentials)
aws_sdk_1.default.config.update({
    accessKeyId: appConfig_1.default.aws.awsKey,
    secretAccessKey: appConfig_1.default.aws.awsSecret,
    region: appConfig_1.default.aws.awsRegion // e.g., 'us-east-1'
});
// Create a new instance of the S3 service
const s3 = new aws_sdk_1.default.S3();
// The function to upload the file to AWS S3
async function uploadFileToS3(file, subFolder) {
    // Validate file type (allow images and PDFs)
    if (!file.mimetype.startsWith('image') &&
        file.mimetype !== 'application/pdf') {
        throw Error('Please upload an image or PDF file');
    }
    // check if file is not too large
    if (file.size > appConfig_1.default.app.maxFileSize) {
        throw Error(`Please upload file less than ${(appConfig_1.default.app.maxFileSize / 1024) * 1024} MB`);
    }
    const params = {
        Bucket: appConfig_1.default.aws.awsBucket,
        Key: appConfig_1.default.app.isDevelopment
            ? `mds-food/test/${subFolder}${file.name}`
            : `mds-food/${subFolder}${file.name}`,
        Body: file.data,
        ACL: 'public-read' // This makes the uploaded file publicly accessible
    };
    try {
        console.log(params);
        const data = await s3.upload(params).promise();
        return {
            url: `https://${data.Bucket}.s3.amazonaws.com/${data.Key}`,
            key: params.Key
        };
    }
    catch (error) {
        throw Error(error.message);
    }
}
exports.uploadFileToS3 = uploadFileToS3;
const deleteS3Object = async (key, file = null) => {
    try {
        await s3
            .deleteObject({
            Bucket: appConfig_1.default.aws.awsBucket,
            Key: key
        })
            .promise();
    }
    catch (deleteError) {
        console.log('Error deleting file from S3:', deleteError);
    }
};
exports.deleteS3Object = deleteS3Object;
