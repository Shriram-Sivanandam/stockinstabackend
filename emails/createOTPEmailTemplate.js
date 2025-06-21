const createOTPEmailTemplate = (otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your OTP Code</title>
        <style>
          /* Mobile responsiveness for clients that support media queries */
          @media only screen and (max-width: 600px) {
            .main-container {
              width: 100% !important;
            }
            .otp-box {
              font-size: 24px !important;
              padding: 12px 25px !important; /* Adjust padding for smaller screens */
            }
          }

          /* Dark theme specific styles for clients that support prefers-color-scheme */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1a1a1a !important;
            }
            .main-container {
              background-color: #2c2c2c !important;
            }
            h2 {
              color: #eeeeee !important;
            }
            .body-text {
              color: #bbbbbb !important;
            }
            .otp-box {
              background-color: #444444 !important;
              color: #ffffff !important;
            }
            .footer-text {
              color: #888888 !important;
            }
            .copyright-text {
              color: #666666 !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f2f2f2;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f2f2f2;">
          <tr>
            <td align="center">
              <table class="main-container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 40px auto; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0;">Your OTP Code</h2>
                  </td>
                </tr>
                <tr>
                  <td class="body-text" style="padding: 20px; text-align: center; font-size: 16px; color: #555555;">
                    Use the following One Time Password (OTP) to complete your verification. The OTP is valid for 10 minutes.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <div class="otp-box" style="display: inline-block; background-color: #f8f8f8; padding: 15px 30px; border-radius: 6px; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #111111;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="footer-text" style="padding: 20px; text-align: center; font-size: 14px; color: #999999;">
                    If you didn’t request this, please ignore this email.
                  </td>
                </tr>
                <tr>
                  <td class="copyright-text" style="padding-top: 20px; text-align: center; font-size: 12px; color: #cccccc;">
                    © 2025 StockInsta. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

module.exports = { createOTPEmailTemplate };