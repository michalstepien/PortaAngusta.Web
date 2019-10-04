import crypto from 'crypto';

export default class Utils {
    public static chceckPassword(password: string, passwordFromDB: string): boolean {
        const pArray = passwordFromDB.split(':');
        if (pArray.length === 3) {
            const pass = pArray[0].replace('{PBKDF2WithHmacSHA256}', '');
            const hash = pArray[1];
            const key = crypto.pbkdf2Sync(Buffer.from(password),
            Int8Array.from(Buffer.from(hash.toLowerCase(), 'hex')),
            65536, 24, 'sha256');

            return pass.toLowerCase() === key.toString('hex');
        }
        return false;
    }
}
