import { requestOTP } from "../src/modules/auth/auth.service.js";

const sendVerificationOTP = async (email: string, purpose: any): Promise<any> => {
  return await requestOTP(email, purpose);
};

export default sendVerificationOTP;
