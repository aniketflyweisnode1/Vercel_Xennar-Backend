// Generate a random 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate OTP with custom length (default 4 digits)
const generateCustomOTP = (length = 4) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// Generate alphanumeric OTP
const generateAlphanumericOTP = (length = 6) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate OTP format (4 digits)
const validateOTP = (otp) => {
  const otpRegex = /^\d{4}$/;
  return otpRegex.test(otp);
};

export {
  generateOTP,
  generateCustomOTP,
  generateAlphanumericOTP,
  validateOTP
}; 