const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;

const isValidAadhaar = (value) => aadhaarRegex.test(String(value || '').replace(/\s+/g, ''));

module.exports = {
  isValidAadhaar,
};
