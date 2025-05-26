const Flutterwave = require('flutterwave-node-v3');
// const open = require('open');
import axios from 'axios';


interface ChargeCard {

    card_number: string;
    cvv: string;
    expiry_month: string;
    expiry_year: string;
    currency: string;
    amount: string;
    redirect_url: string;
    fullname: string;
    email: string;
    phone_number: string;
    enckey: string;
    tx_ref: string;
    authorization?: { mode: string; fields: string[]; pin?: number; }; // Optional field for authorization
}

interface BankTrf {
    tx_ref: string;
    amount: string;
    email: string;
    phone_number: string;
    currency: string;
    client_ip: string;
    device_fingerprint: string;
    narration: string;
    is_permanent: boolean;
    expires: number;
} // Optional field for bank transfer

interface PaymentLinkPayload {
    tx_ref: string;
    amount: string;
    currency: string;
    redirect_url: string;
    customer: { email: string; name: string; phonenumber: string }; // Optional field for customer
    customizations: { title: string }; // Optional field for customizations
}


const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


// Initiating the transaction
let chargeCardPayload: ChargeCard = {
    "card_number": "5531886652142950",
    "cvv": "564",
    "expiry_month": "09",
    "expiry_year": "21",
    "currency": "NGN",
    "amount": "100",
    "redirect_url": "https://www.google.com",
    "fullname": "Flutterwave Developers",
    "email": "developers@flutterwavego.com",
    "phone_number": "09000000000",
    "enckey": `${process.env.FLW_ENCRYPTION_KEY}`,
    "tx_ref": "example01",
}

export const generateFlutterwavePaymentLink = async (payload: PaymentLinkPayload) => {
    try {
        const response = await axios.post(`${process.env.FLW_PAYMENT_LINK}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data; // Return the payment link
    } catch (err: any) {
        return false;
        console.error(err.code);
        console.error(err.response.data);
    }
}

const chargeCard = async (payload: ChargeCard) => {
    try {
        const response = await flw.Charge.card(payload)
        console.log(response)

        // Authorizing transactions

        // For PIN transactions
        if (response.meta.authorization.mode === 'pin') {
            let payload2 = payload
            payload2.authorization = {
                "mode": "pin",
                "fields": [
                    "pin"
                ],
                "pin": 3310
            }
            const reCallCharge = await flw.Charge.card(payload2)

            // Add the OTP to authorize the transaction
            const callValidate = await flw.Charge.validate({
                "otp": "12345",
                "flw_ref": reCallCharge.data.flw_ref
            })
            console.log(callValidate)

        }
        // For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
        // if (response.meta.authorization.mode === 'redirect') {

        //     var url = response.meta.authorization.redirect
        //     open(url)
        // }

        console.log(response)


    } catch (error) {
        console.log(error)
    }
}
const bankTrfPayload: BankTrf = {
    "tx_ref": "MC-1585230950508",
    "amount": "1500",
    "email": "johnmadakin@gmail.com",
    "phone_number": "054709929220",
    "currency": "NGN",
    "client_ip": "154.123.220.1",
    "device_fingerprint": "62wd23423rq324323qew1",
    "narration": "All star college salary for May",
    "is_permanent": false,
    "expires": 3600
}

const bank_trf = async (payload: BankTrf) => { // Optional field for bank transfer

    try {


        const response = await flw.Charge.bank_transfer(payload)
        console.log(response);

    } catch (error) {
        console.log(error)
    }

}

