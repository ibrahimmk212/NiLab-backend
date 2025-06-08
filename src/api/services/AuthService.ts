import UserRepository from '../repositories/UserRepository';
import { User } from '../models/User';
import JWT from '../../utils/jwt';
import {
    LoginType,
    SignUpType,
    VendorSignUpType,
    VerifyOTP
} from '../types/auth';
import appConfig from '../../config/appConfig';
import bcrypt from 'bcrypt';

interface IAuthService {
    login(payload: LoginType): Promise<{ token: string; user: User }>;
    customerSignUp(payload: User): Promise<User | null>;
    updatePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<User | null>;
}

class AuthService implements IAuthService {
    async login(payload: LoginType): Promise<{ token: string; user: User }> {
        // if (payload.phone.length < 11 && !payload.phone.startsWith('0')) {
        //     payload.phone = `0${payload.phone}`;
        // }
        // console.log(payload.phone)

        const user = await UserRepository.findUserByEmail(payload.email || '');

        if (!user) {
            throw new Error(
                'Invalid credentials, check your phone number again.'
            );
        }

        const isValid = await user.matchPassword(payload.password);

        if (!isValid) {
            throw new Error('Invalid credentials, check your password again.');
        }

        const token = user.getSignedJwtToken();

        if (!token) {
            throw new Error('Invalid token');
        }

        return { token, user };
    }

    async verifyEmail(email: string): Promise<string | undefined> {
        const user = await UserRepository.findUserByKey('email', email);

        if (user) {
            throw new Error('Email has already been used');
        }
        // TODO send email OTP
        const otp = '1234';

        // generate temporary token
        const token = await JWT.signTempToken({
            email,
            otp,
            purpose: 'email-verify'
        });

        return token;
    }

    async verifyPhone(
        countryCode: string,
        phone: string
    ): Promise<string | undefined> {
        if (countryCode === '234' || countryCode === '+234') {
            if (phone.length === 11 && phone.startsWith('0')) {
                phone = phone.slice(1);
            }
        }

        const user = await UserRepository.findUserByKey('phoneNumber', phone);
        if (user) {
            throw new Error('Phone has already been used');
        }
        // TODO send email OTP
        const otp = '1234';

        // generate temporary token
        const token = await JWT.signTempToken({
            phoneNumber: phone,
            countryCode: countryCode,
            otp,
            purpose: 'phone-verify'
        });

        return token;
    }

    async verifyOTP(payload: VerifyOTP): Promise<string | undefined> {
        const data = await JWT.verifyTempToken(payload.token, payload.purpose);

        if (data?.otp !== payload.otp) {
            return;
        }
        const purpose =
            payload.purpose === 'email-verify' ||
            payload.purpose === 'phone-verify'
                ? 'signup'
                : payload.purpose === 'forgot-password'
                ? 'reset-password'
                : 'none';

        console.log(purpose);
        const token = await JWT.signTempToken({
            email: data?.email,
            phoneNumber: data?.phoneNumber,
            purpose
        });

        return token;
    }

    async forgotPassword(email: string): Promise<string | undefined> {
        const user = await UserRepository.findUserByKey('email', email);

        if (!user) {
            throw new Error('User does not exists');
        }

        // TODO send email OTP
        const otp = '1234';

        // generate temporary token
        const token = await JWT.signTempToken({
            email,
            otp,
            purpose: 'forgot-password'
        });

        return token;
    }

    async vendorSignUp(payload: VendorSignUpType): Promise<any | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );
        if (!savedData) {
            throw Error('Invalid token');
        }
        console.log('payload', payload);
        console.log('saved Data', savedData);
        const user =
            savedData.purpose === 'email-verify'
                ? await UserRepository.findUserByKey(
                      'phoneNumber',
                      payload.phoneNumber
                  )
                : await UserRepository.findUserByKey('email', savedData.email);
        if (user)
            throw Error(
                savedData.purpose === 'email-verify'
                    ? 'Phone already exists'
                    : 'Email already exists'
            );
        // TODO check Vendors email address, if exists.
        // TODO check Vendors phone address, if exists.
        return await UserRepository.createVendorUser({
            ...payload,
            email: savedData.email,
            password: payload.password
        });
    }

    async RiderSignUp(payload: VendorSignUpType): Promise<any | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );
        if (!savedData) {
            throw Error('Invalid token');
        }

        // payload.email = savedData?.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        delete payload?.token;
        // const hashedPassword = bcrypt.hashSync(
        //     payload.password,
        //     appConfig.app.hashSalt
        // );
        const user =
            savedData.purpose === 'email-verify'
                ? await UserRepository.findUserByKey(
                      'phoneNumber',
                      savedData.phoneNumber
                  )
                : await UserRepository.findUserByKey('email', savedData.email);
        if (user)
            throw Error(
                savedData.purpose === 'email-verify'
                    ? 'Phone already exists'
                    : 'Email already exists'
            );

        return await UserRepository.createVendorUser({
            ...payload,
            email: payload.email,
            phoneNumber: savedData.phoneNumber,
            password: payload.password
        });
    }

    async customerSignUp(payload: SignUpType): Promise<User | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );

        if (!savedData) {
            throw Error('Invalid token');
        }

        payload.email = savedData?.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        delete payload?.token;
        // const hashedPassword = bcrypt.hashSync(
        //     payload.password,
        //     appConfig.app.hashSalt
        // );
        const user =
            savedData.purpose === 'email-verify'
                ? await UserRepository.findUserByKey(
                      'phoneNumber',
                      payload.phoneNumber
                  )
                : await UserRepository.findUserByKey('email', payload.email);
        if (user)
            throw Error(
                savedData.purpose === 'email-verify'
                    ? 'Phone already exists'
                    : 'Email already exists'
            );
        console.log('payloAS', {
            ...payload,
            email: payload.email,
            password: payload.password
        });
        return await UserRepository.createCustomerUser({
            ...payload,
            email: payload.email,
            password: payload.password
        });
    }

    async setPin(payload: User, pin: string): Promise<User | null> {
        const hashedPin = bcrypt.hashSync(pin, appConfig.app.hashSalt);
        payload.pin = hashedPin;

        return await UserRepository.updateUser(payload.id as string, payload);
    }

    async resetPassword(password: string, token: string): Promise<User> {
        const savedData = await JWT.verifyTempToken(token, 'reset-password');
        if (!savedData) {
            throw Error('Invalid token');
        }

        const user = await UserRepository.findUserByKey(
            'email',
            savedData.email as string
        );

        if (!user) {
            throw new Error('User not found');
        }
        // const hashedPassword = bcrypt.hashSync(
        //     password,
        //     appConfig.app.hashSalt
        // );

        user.password = password;

        await UserRepository.updateUser(user.id, user);

        return user;
    }

    async updatePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<User | null> {
        const user = await UserRepository.findUserById(userId, '+password');

        if (!user) {
            throw new Error('Invalid request, try loggin in again.');
        }

        console.log(user);
        const isValid = await user.matchPassword(currentPassword);

        if (!isValid) {
            throw new Error('check your current password again.');
        }

        user.password = newPassword;

        await user.save({ validateBeforeSave: true });

        return user;
    }
}

export default new AuthService();
