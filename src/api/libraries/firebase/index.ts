import admin from './firebaseAdmin';

export const sendPushNotification = async (
    token: string,
    title: string,
    body: string
) => {
    // If no token, skip
    if (!token) return;

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
