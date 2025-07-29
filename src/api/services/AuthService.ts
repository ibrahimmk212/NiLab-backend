import UserRepository from '../repositories/UserRepository';
import { User } from '../models/User';
import JWT from '../../utils/jwt';
import {
    LoginType,
    RiderSignUpType,
    SignUpType,
    VendorSignUpType,
    VerifyOTP
} from '../types/auth';
import appConfig from '../../config/appConfig';
import bcrypt from 'bcrypt';
import emails from '../libraries/emails';
import { generateRandomNumbers } from '../../utils/helpers';

interface IAuthService {
    login(payload: LoginType): Promise<{ token: string; user: User }>;
    signUp(payload: User): Promise<User | null>;
    updatePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<User | null>;
}

class AuthService implements IAuthService {
    async login(payload: LoginType): Promise<{ token: string; user: User }> {
        const user = await UserRepository.findUserByEmail(
            payload.email.toLowerCase()
        );

        if (!user) {
            throw new Error('Invalid credentials, check your email again.');
        }

        console.log(user);
        const isValid = await user.matchPassword(payload.password);

        if (!isValid) {
            throw new Error('Invalid credentials, check your password again.');
        }

        const token = await user.getSignedJwtToken();

        if (!token) {
            throw new Error('Invalid token');
        }

        return { token, user };
    }

    async verifyEmail(email: string): Promise<string | any> {
        const user = await UserRepository.findUserByKey('email', email);

        if (user) {
            throw new Error('Email has already been used');
        }

        const otp = generateRandomNumbers(4).toString();

        emails.verifyEmail(email, {
            name: 'Customer',
            otpCode: otp,
            expiryTime: '24 hours'
        });

        // generate temporary token
        const token = await JWT.signTempToken({
            email,
            otp,
            purpose: 'email-verify'
        });

        return { token, otp };
    }

    async verifyOTP(payload: VerifyOTP): Promise<string | undefined> {
        const data = await JWT.verifyTempToken(payload.token, payload.purpose);
        console.log(data);

        if (data?.otp !== payload.otp) {
            return;
        }
        const purpose =
            payload.purpose === 'email-verify'
                ? 'signup'
                : payload.purpose === 'forgot-password'
                ? 'reset-password'
                : 'none';

        console.log(purpose);
        const token = await JWT.signTempToken({
            email: data?.email,
            purpose
        });

        return token;
    }

    async forgotPassword(email: string): Promise<string | undefined> {
        const user = await UserRepository.findUserByKey('email', email);

        if (!user) {
            throw new Error('User does not exists');
        }

        const otp = generateRandomNumbers(4).toString();

        emails.forgotPassword(email, {
            name: user.firstName,
            otp: otp,
            expiryTime: '24 hours'
        });
        // generate temporary token
        const token = await JWT.signTempToken({
            email,
            otp,
            purpose: 'forgot-password'
        });

        return token;
    }

    async signUp(payload: SignUpType | RiderSignUpType): Promise<User | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );
        if (!savedData) {
            throw Error('Invalid token');
        }

        payload.email = savedData?.email;
        delete payload?.token;

        emails.customerWelcome(payload.email, {
            name: payload.firstName
        });
        return await UserRepository.createUser({
            ...payload,
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

    async riderSignUp(payload: RiderSignUpType): Promise<any | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );
        if (!savedData) {
            throw Error('Invalid token');
        }

        delete payload?.token;
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

        return await UserRepository.createRiderUser({
            ...payload,
            email: savedData.email,
            phoneNumber: payload.phoneNumber,
            password: payload.password
        });
    }

    async customerSignUp(payload: SignUpType): Promise<User | null> {
        const savedData = await JWT.verifyTempToken(
            payload?.token as string,
            'signup'
        );

        console.log('savedData', payload);

        if (!savedData) {
            throw Error('Invalid token');
        }

        payload.email = savedData?.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        // delete payload?.token;
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
}

export default new AuthService();
