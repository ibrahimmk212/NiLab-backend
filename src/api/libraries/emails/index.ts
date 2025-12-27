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
import { mailTransporter } from '../../../utils/mail/mailer';

const sendEmail = async (
    email: string,
    subject: string,
    htmlToSend: string
) => {
    try {
        const info = await mailTransporter.sendMail({
            from: `${appConfig.mailer.fromName} <${appConfig.mailer.fromEmail}>`,
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
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    riderWelcome = async (email: string, data: IRiderWelcome) => {
        const welcomeTemplate = getTemplate('riderWelcome');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    verifyEmail = async (email: string, data: IVerifyEmail) => {
        const welcomeTemplate = getTemplate('verifyEmail');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Verify Email', htmlContent);
    };

    forgotPassword = async (email: string, data: IForgotPassword) => {
        const welcomeTemplate = getTemplate('forgotPassword');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Password Reset OTP', htmlContent);
    };

    vendorOnboarding = async (email: string, data: IVendorOnboarding) => {
        const welcomeTemplate = getTemplate('vendorOnboarding');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    vendorSuspended = async (email: string, data: IVendorAccountSuspension) => {
        const welcomeTemplate = getTemplate('vendorSuspension');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Account Suspended', htmlContent);
    };
    vendorBankUpdate = async (
        email: string,
        data: IVendorBankDetailsUpdate
    ) => {
        const welcomeTemplate = getTemplate('vendorBankUpdate');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Bank Details Update', htmlContent);
    };

    riderVerified = async (email: string, data: IRiderAccountVerified) => {
        const welcomeTemplate = getTemplate('riderVerified');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Account Verified', htmlContent);
    };
    riderSuspended = async (email: string, data: IRiderAccountSuspended) => {
        const welcomeTemplate = getTemplate('riderSuspended');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Account Suspended', htmlContent);
    };

    vendorOrder = async (email: string, data: IVendorNewOrder) => {
        const welcomeTemplate = getTemplate('vendorOrder');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: New Order', htmlContent);
    };

    orderPaymentReceipt = async (
        email: string,
        data: IVendorOrderPaymentReceipt
    ) => {
        const welcomeTemplate = getTemplate('orderPaymentReceipt');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: Order Payment Complete', htmlContent);
    };

    orderConfirmation = async (email: string, data: IOrderConfirmation) => {
        const welcomeTemplate = getTemplate('customerWelcome');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    availableDelivery = async (
        email: string,
        data: IRiderDeliveryRequestAvailable
    ) => {
        const welcomeTemplate = getTemplate('availableDelivery');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Terminus: New Delivery', htmlContent);
    };

    deliveryConfirmation = async (
        email: string,
        data: IDeliveryStatusUpdate
    ) => {
        const welcomeTemplate = getTemplate('deliveryConfirmation');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    customerDeliveryCode = async (
        email: string,
        data: IDeliveryStatusUpdate
    ) => {
        const welcomeTemplate = getTemplate('customerDeliveryCode');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    deliveryOrder = async (email: string, data: IDeliveryStatusUpdate) => {
        const welcomeTemplate = getTemplate('deliveryOrder');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };

    deliveryPayment = async (
        email: string,
        data: IRiderDeliveryPaymentReceipt
    ) => {
        const welcomeTemplate = getTemplate('deliveryPayment');
        const htmlContent = welcomeTemplate(data);
        await sendEmail(email, 'Welcome to Terminus', htmlContent);
    };
}

export default new EmailTemplate();
