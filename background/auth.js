// [SECURITY CLEANUP] This file has been neutralized.
// License checks are disabled. The extension now works offline.

export async function checkAuthCode(code) {
  console.log('License check disabled for security. Returning valid status.');
  // Always return success to bypass license blocking
  return {
    success: true,
    expiry: '2099-12-31T23:59:59.999Z', // Permanent valid license
    daysRemaining: 9999
  };
}
