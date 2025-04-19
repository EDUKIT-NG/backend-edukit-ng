// import Logger from "./Logger.js";

// const logger = Logger.getLogger("LoginLimiter");
const failedLoginAttempts = new Map();

// Progressive lockout settings
const BASE_LOCKOUT_TIME = 3 * 10 * 1000;
const LOCKOUT_MULTIPLIER = 2;

export const trackFailedLogin = (email) => {
  const now = Date.now();
  const attempts = failedLoginAttempts.get(email) || {
    count: 0,
    lockUntil: null,
  };

  // If account is already locked, return remaining time
  if (attempts.lockUntil && now < attempts.lockUntil) {
    return { locked: true, remainingTime: (attempts.lockUntil - now) / 1000 };
  }

  // Increment failed attempts
  attempts.count += 1;

  // If the user reaches 5 failed attempts, start lockout
  if (attempts.count >= 5) {
    const newLockoutTime =
      BASE_LOCKOUT_TIME * Math.pow(LOCKOUT_MULTIPLIER, attempts.count - 5);
    attempts.lockUntil = now + newLockoutTime;
  }

  failedLoginAttempts.set(email, attempts);
  logger.info(
    `Failed login attempts: ${JSON.stringify(
      Array.from(failedLoginAttempts),
      null,
      2
    )}`
  );
  return {
    locked: !!attempts.lockUntil,
    remainingTime: attempts.lockUntil ? (attempts.lockUntil - now) / 1000 : 0,
  };
};

// Reset failed attempts on successful login
export const resetFailedLogin = (email) => {
  logger.info(
    `Failed login attempts: ${JSON.stringify(
      Array.from(failedLoginAttempts),
      null,
      2
    )}`
  );
  failedLoginAttempts.delete(email);
};

// Admin unlock function
export const unlockUser = (email) => {
  failedLoginAttempts.delete(email);
};
