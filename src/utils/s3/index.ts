import AWS from 'aws-sdk';
import appConfig from '../../config/appConfig';

// Configure AWS credentials (replace 'your-access-key' and 'your-secret-key' with your actual credentials)
AWS.config.update({
    accessKeyId: appConfig.aws.awsKey,
    secretAccessKey: appConfig.aws.awsSecret,
    region: appConfig.aws.awsRegion // e.g., 'us-east-1'
});

// Create a new instance of the S3 service
const s3 = new AWS.S3();

// The function to upload the file to AWS S3
export async function uploadFileToS3(file: any, subFolder: any) {
    // Validate file type (allow images and PDFs)
    // console.log(file, subFolder);
    // if (
    //     !file.mimetype.startsWith('image') &&
    //     file.mimetype !== 'application/pdf'
    // ) {
    //     throw Error('Please upload an image or PDF file');
    // }

    // check if file is not too large
    if (file.size > appConfig.app.maxFileSize) {
        throw Error(
            `Please upload file less than ${
                (appConfig.app.maxFileSize / 1024) * 1024
            } MB`
        );
    }

    const params: any = {
        Bucket: appConfig.aws.awsBucket, // Replace 'your-bucket-name' with your S3 bucket name
        Key: appConfig.app.isDevelopment
            ? `mds-food/test/${subFolder}${file.name}`
            : `mds-food/${subFolder}${file.name}`, // The file path in the bucket (change as needed)
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
    } catch (error: any) {
        throw Error(error.message);
    }
}

export const deleteS3Object = async (key: any, file: any = null) => {
    try {
        await s3
            .deleteObject({
                Bucket: appConfig.aws.awsBucket as string,
                Key: key
            })
            .promise();
    } catch (deleteError) {
        console.log('Error deleting file from S3:', deleteError);
    }
};
