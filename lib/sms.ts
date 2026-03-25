import axios from 'axios';

const SMS_API_KEY = process.env.SMS_API_KEY;

export const sendOtpViaSMS = async (phoneNumber: string, otp: string): Promise<boolean> => {
    if (!SMS_API_KEY) {
        console.error('SMS_API_KEY is missing');
        // fallback for development if needed, but for now allow fail
        return false;
    }

    try {
        // Defines the template (OTP1 is default)
        const url = `https://2factor.in/API/V1/${SMS_API_KEY}/SMS/${phoneNumber}/${otp}/OTP1`;
        await axios.get(url);
        console.log(`SMS OTP sent to ${phoneNumber}`);
        return true;
    } catch (error: any) {
        console.error('Error sending SMS:', error.message);
        return false;
    }
};
