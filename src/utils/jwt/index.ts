import AppConfig from '../../config/appConfig';
import * as jwt from 'jsonwebtoken';

class JWT {
    signToken(userId: number, expires = '1d'): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                {
                    id: userId,
                    iat: Date.now()
                },
                AppConfig.app.secret,
                {
                    expiresIn: expires
                },
                (err, token) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(token);
                }
            );
        });
    }
    signTempToken(
        data: {
            email?: string;
            phoneNumber?: string;
            countryCode?: string;
            otp?: string;
            purpose: string;
        },
        expires = '1d'
    ): Promise<string | undefined> {
        console.log(data);
        return new Promise((resolve, reject) => {
            jwt.sign(
                {
                    ...data,
                    iat: Date.now()
                },
                AppConfig.app.tempSecret + data.purpose,
                {
                    expiresIn: expires
                },
                (err, token) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(token);
                }
            );
        });
    }

    verifyToken(token: string): Promise<jwt.JwtPayload | undefined> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, AppConfig.app.secret, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded as jwt.JwtPayload);
            });
        });
    }

    verifyTempToken(
        token: string,
        purpose: string
    ): Promise<jwt.JwtPayload | undefined> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                AppConfig.app.tempSecret + purpose,
                (err, decoded) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(decoded as jwt.JwtPayload);
                }
            );
        });
    }
}

export default new JWT();
