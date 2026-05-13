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

export const sendTopicNotification = async (
    topic: string,
    title: string,
    body: string,
    data?: any
) => {
    const message = {
        notification: {
            title,
            body
        },
        topic: topic,
        data: data || {}
    };

    try {
        const response = await admin.messaging().send(message);
        console.log(`Successfully sent topic message (${topic}):`, response);
        return response;
    } catch (error) {
        console.error(`Error sending topic message (${topic}):`, error);
        throw error;
    }
};

export const sendMulticastNotification = async (
    tokens: string[],
    title: string,
    body: string,
    data?: any
) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: {
            title,
            body
        },
        tokens: tokens,
        data: data || {}
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent multicast message to ${response.successCount} devices.`);
        return response;
    } catch (error) {
        console.error('Error sending multicast message:', error);
        throw error;
    }
};

export const subscribeToTopic = async (tokens: string | string[], topic: string) => {
    const tokenList = Array.isArray(tokens) ? tokens : [tokens];
    if (tokenList.length === 0 || !tokenList[0]) return;

    try {
        const response = await admin.messaging().subscribeToTopic(tokenList, topic);
        console.log(`Successfully subscribed ${response.successCount} tokens to topic: ${topic}`);
        return response;
    } catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
    }
};

export const unsubscribeFromTopic = async (tokens: string | string[], topic: string) => {
    const tokenList = Array.isArray(tokens) ? tokens : [tokens];
    if (tokenList.length === 0 || !tokenList[0]) return;

    try {
        const response = await admin.messaging().unsubscribeFromTopic(tokenList, topic);
        console.log(`Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`);
        return response;
    } catch (error) {
        console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
};
