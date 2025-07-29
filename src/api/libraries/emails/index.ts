import transporter from '../../../utils/nodemailer';
import appConfig from '../../../config/appConfig';
import {
    IRiderWelcome,
    IWelcomeEmail,
    IVerifyEmail,
    IForgotPassword,
    IVendorOnboarding,
    IVendorAccountSuspension,
    IVendorBankDetailsUpdate,
    IRiderAccountVerified,
    IRiderAccountSuspended,
    IVendorNewOrder,
    IVendorOrderPaymentReceipt,
    IRiderDeliveryRequestAvailable,
    IOrderConfirmation,
    IDeliveryStatusUpdate,
    IRiderDeliveryPaymentReceipt
} from './types';
import { getTemplate } from './templates';

const sendEmail = async (
    email: string,
    subject: string,
    htmlToSend: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `${appConfig.nodemailer.fromName} <${appConfig.nodemailer.fromEmail}>`,
            to: email,
            subject,
            html: htmlToSend
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error(error);
    }
};

class EmailTemplate {
    customerWelcome = async (email: string, data: IWelcomeEmail) => {
        const welcomeTemplate = getTemplate('customerWelcome');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    riderWelcome = async (email: string, data: IRiderWelcome) => {
        const welcomeTemplate = getTemplate('riderWelcome');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    verifyEmail = async (email: string, data: IVerifyEmail) => {
        const welcomeTemplate = getTemplate('verifyEmail');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Verify Email', htmlContent);
    };

    forgotPassword = async (email: string, data: IForgotPassword) => {
        const welcomeTemplate = getTemplate('forgotPassword');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Password Reset OTP', htmlContent);
    };

    vendorOnboarding = async (email: string, data: IVendorOnboarding) => {
        const welcomeTemplate = getTemplate('vendorOnboarding');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    vendorSuspended = async (email: string, data: IVendorAccountSuspension) => {
        const welcomeTemplate = getTemplate('vendorSuspension');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Account Suspended', htmlContent);
    };
    vendorBankUpdate = async (
        email: string,
        data: IVendorBankDetailsUpdate
    ) => {
        const welcomeTemplate = getTemplate('vendorBankUpdate');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Bank Details Update', htmlContent);
    };

    riderVerified = async (email: string, data: IRiderAccountVerified) => {
        const welcomeTemplate = getTemplate('riderVerified');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Account Verified', htmlContent);
    };
    riderSuspended = async (email: string, data: IRiderAccountSuspended) => {
        const welcomeTemplate = getTemplate('riderSuspended');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: Account Suspended', htmlContent);
    };

    vendorOrder = async (email: string, data: IVendorNewOrder) => {
        const welcomeTemplate = getTemplate('vendorOrder');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: New Order', htmlContent);
    };

    orderPaymentReceipt = async (
        email: string,
        data: IVendorOrderPaymentReceipt
    ) => {
        const welcomeTemplate = getTemplate('orderPaymentReceipt');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(
            email,
            'MDS Foods: Order Payment Complete',
            htmlContent
        );
    };

    orderConfirmation = async (email: string, data: IOrderConfirmation) => {
        const welcomeTemplate = getTemplate('customerWelcome');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    availableDelivery = async (
        email: string,
        data: IRiderDeliveryRequestAvailable
    ) => {
        const welcomeTemplate = getTemplate('availableDelivery');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'MDS Foods: New Delivery', htmlContent);
    };

    deliveryConfirmation = async (
        email: string,
        data: IDeliveryStatusUpdate
    ) => {
        const welcomeTemplate = getTemplate('deliveryConfirmation');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    customerDeliveryCode = async (
        email: string,
        data: IDeliveryStatusUpdate
    ) => {
        const welcomeTemplate = getTemplate('customerDeliveryCode');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    deliveryOrder = async (email: string, data: IDeliveryStatusUpdate) => {
        const welcomeTemplate = getTemplate('deliveryOrder');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };

    deliveryPayment = async (
        email: string,
        data: IRiderDeliveryPaymentReceipt
    ) => {
        const welcomeTemplate = getTemplate('deliveryPayment');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to MDS Foods', htmlContent);
    };
}

export default new EmailTemplate();
