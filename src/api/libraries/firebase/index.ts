import admin from './firebaseAdmin'; // The file where you initialized Firebase Admin SDK

export const sendPushNotification = async (
    token: string,
    title: string,
    body: string
) => {
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Example usage
