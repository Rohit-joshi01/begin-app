import { requestOTP } from "../src/modules/auth/auth.service.ts";

const sendVerificationOTP = async (email: string, purpose: any): Promise<any> => {
  return await requestOTP(email, purpose);
};

export default sendVerificationOTP;
