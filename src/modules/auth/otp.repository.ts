import EmailOTP from "./models/otp.model.ts";
import type { IEmailOTP, OTPPurpose } from "../../shared/types/database.types.ts";

/**
 * Repository for EmailOTP records.
 *
 * All methods return plain JS objects (never raw Mongoose documents)
 * so callers remain decoupled from the ORM layer.
 */

/**
 * Find the most recent active (unused, unexpired) OTP record for a given
 * email and purpose combination.
 */
export async function findActiveOTP(email: string, purpose: OTPPurpose | string): Promise<IEmailOTP | null> {
  const doc = await EmailOTP.findOne({
    email,
    purpose: purpose as OTPPurpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).lean<IEmailOTP>();
  return doc || null;
}

/**
 * Insert a new EmailOTP record.
 */
export async function createOTP(data: Partial<IEmailOTP>): Promise<IEmailOTP> {
  const doc = await EmailOTP.create(data);
  return doc.toObject() as IEmailOTP;
}

/**
 * Mark an OTP record as used by setting isUsed to true and recording
 * the verification timestamp.
 */
export async function markOTPUsed(id: string | any): Promise<void> {
  await EmailOTP.updateOne(
    { _id: id },
    { isUsed: true, verifiedAt: new Date() }
  );
}

/**
 * Delete all OTP records for a given email and purpose.
 * Used to invalidate previous OTPs before issuing a new one.
 */
export async function deleteOTPsByEmailAndPurpose(email: string, purpose: OTPPurpose | string): Promise<number> {
  const result = await EmailOTP.deleteMany({ email, purpose: purpose as OTPPurpose });
  return result.deletedCount;
}

/**
 * Delete a single OTP record by its database identifier.
 */
export async function deleteOTPById(id: string | any): Promise<boolean> {
  const result = await EmailOTP.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

/**
 * Increment the failed-attempt counter on an OTP record.
 * Called after each incorrect OTP submission.
 */
export async function incrementAttempts(id: string | any): Promise<void> {
  await EmailOTP.updateOne({ _id: id }, { $inc: { attempts: 1 } });
}

/**
 * Find a single OTP record by generic filter.
 */
export async function findOne(filter: Record<string, any>): Promise<IEmailOTP | null> {
  const doc = await EmailOTP.findOne(filter).lean<IEmailOTP>();
  return doc || null;
}

/**
 * Find a recent OTP record created within a given cooldown window.
 * Used to enforce rate-limiting on OTP requests.
 */
export async function findRecentOTP(
  email: string,
  purpose: OTPPurpose | string,
  since: Date
): Promise<IEmailOTP | null> {
  const doc = await EmailOTP.findOne({
    email,
    purpose: purpose as OTPPurpose,
    createdAt: { $gt: since },
  }).lean<IEmailOTP>();
  return doc || null;
}

const otpRepository = {
  findActiveOTP,
  createOTP,
  markOTPUsed,
  deleteOTPsByEmailAndPurpose,
  deleteOTPById,
  incrementAttempts,
  findOne,
  findRecentOTP,
};

export default otpRepository;
