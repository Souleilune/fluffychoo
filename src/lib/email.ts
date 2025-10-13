import nodemailer from 'nodemailer';

// Create reusable transporter with explicit Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email template for order confirmation
export function generateOrderConfirmationEmail(orderDetails: {
  name: string;
  email: string;
  order: string;
  quantity: number;
  location: string;
  contactNumber: string;
  orderReference: string;
}) {
  const { name, email, order, quantity, location, contactNumber, orderReference } = orderDetails;
  
  return {
    from: {
      name: 'FluffyChoo',
      address: process.env.EMAIL_USER!,
    },
    to: email,
    subject: `Order Confirmation - FluffyChoo`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <title>Order Confirmation</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            /* Light mode colors (default) */
            :root {
              color-scheme: light dark;
            }
            
            /* Dark mode colors - soft dark warm yellowy palette */
            @media (prefers-color-scheme: dark) {
              .email-body { 
                background-color: #1a1410 !important; 
              }
              .email-container { 
                background-color: #2d2416 !important; 
                border-color: #4a3a1f !important;
              }
              .email-header { 
                background: linear-gradient(to right, #3d2f1a, #4a3a1f) !important; 
              }
              .email-section {
                background-color: #3d2f1a !important;
                border-color: #5a4a2f !important;
              }
              .text-primary { 
                color: #fef3c7 !important; 
              }
              .text-secondary { 
                color: #fde68a !important; 
              }
              .text-tertiary { 
                color: #fcd34d !important; 
              }
            }

            /* Base styles */
            body {
              margin: 0;
              padding: 0;
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
          </style>
        </head>
        <body class="email-body" style="margin: 0; padding: 0; background-color: #fefce8;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table class="email-container" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fde68a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td class="email-header" style="background: linear-gradient(to right, #fffcdb, #fef3c7); padding: 32px 24px; text-align: center;">
                      <h1 class="text-primary" style="margin: 0; color: #713f12; font-size: 28px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                         FluffyChoo
                      </h1>
                      <p class="text-secondary" style="margin: 8px 0 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        Premium Mochi Brownies
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      
                      <!-- Welcome Message -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <h2 class="text-primary" style="margin: 0 0 8px; color: #713f12; font-size: 22px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                          Order Confirmed! 
                        </h2>
                        <p class="text-secondary" style="margin: 8px 0 0; color: #78350f; font-size: 15px; font-family: 'Poppins', sans-serif;">
                          Thank you for your order, ${name}!
                        </p>
                      </div>

                      <!-- Order Reference -->
                      <div style="text-align: center; margin-bottom: 24px; padding: 16px; background: linear-gradient(to right, #fef3c7, #fde68a); border-radius: 8px;">
                        <p class="text-secondary" style="margin: 0 0 4px; color: #78350f; font-size: 12px; font-weight: 500; font-family: 'Poppins', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                          Order Reference
                        </p>
                        <p class="text-primary" style="margin: 0; color: #713f12; font-size: 24px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                          ${orderReference}
                        </p>
                        <p class="text-secondary" style="margin: 4px 0 0; color: #78350f; font-size: 11px; font-family: 'Poppins', sans-serif;">
                          Save this for your records
                        </p>
                      </div>

                      <!-- Order Details -->
                      <div class="email-section" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 class="text-primary" style="margin: 0 0 16px; color: #713f12; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                          Order Details
                        </h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td class="text-secondary" style="padding: 6px 0; color: #78350f; font-size: 14px; width: 35%; font-family: 'Poppins', sans-serif;">
                              Product
                            </td>
                            <td class="text-primary" style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${order}
                            </td>
                          </tr>
                          <tr>
                            <td class="text-secondary" style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              Quantity
                            </td>
                            <td class="text-primary" style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${quantity}
                            </td>
                          </tr>
                          <tr>
                            <td class="text-secondary" style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              Location
                            </td>
                            <td class="text-primary" style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${location}
                            </td>
                          </tr>
                          <tr>
                            <td class="text-secondary" style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              Contact
                            </td>
                            <td class="text-primary" style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${contactNumber}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- What's Next -->
                      <div class="email-section" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 class="text-primary" style="margin: 0 0 12px; color: #713f12; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                          What's Next? 
                        </h3>
                        <p class="text-secondary" style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; font-family: 'Poppins', sans-serif;">
                          Our team will contact you shortly to confirm your order and arrange delivery details. We bake everything fresh, so your FluffyChoo treats will be made with love just for you!
                        </p>
                      </div>

                      <!-- Call to Action -->
                      <div style="text-align: center; margin-top: 24px;">
                        <p class="text-secondary" style="margin: 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                          Questions? Reply to this email or give us a call.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fef3c7; padding: 20px 24px; text-align: center; border-top: 1px solid #fde68a;">
                      <p class="text-tertiary" style="margin: 0; color: #92400e; font-size: 12px; font-family: 'Poppins', sans-serif;">
                        © ${new Date().getFullYear()} FluffyChoo. All rights reserved.
                      </p>
                      <p class="text-tertiary" style="margin: 0; color: #92400e; font-size: 12px; font-family: 'Poppins', sans-serif;">
                        Freshly baked with love and fluff
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      Order Confirmation - FluffyChoo
      
      Thank you for your order, ${name}!
      
      ORDER REFERENCE: ${orderReference}
      (Save this for your records)
      
      ORDER DETAILS:
      - Product: ${order}
      - Quantity: ${quantity}
      - Delivery Location: ${location}
      - Contact Number: ${contactNumber}
      
      WHAT'S NEXT?
      Our team will contact you shortly to confirm your order and arrange delivery details. 
      We bake everything fresh, so your FluffyChoo treats will be made with love just for you!
      
      Questions? Reply to this email or give us a call.
      
      © ${new Date().getFullYear()} FluffyChoo - Freshly baked with love and fluff
    `,
  };
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(orderDetails: {
  name: string;
  email: string;
  order: string;
  quantity: number;
  location: string;
  contactNumber: string;
  orderReference: string;
}) {
  try {
    // Log configuration for debugging (without exposing the full password)
    console.log('📧 Email Configuration Check:');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing');
    console.log('- Recipient:', orderDetails.email);
    
    // Check if credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local');
    }

    const mailOptions = generateOrderConfirmationEmail(orderDetails);
    
    console.log('📤 Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Order confirmation email sent successfully!');
    console.log('- Message ID:', info.messageId);
    console.log('- Response:', info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log detailed error information
    console.error('❌ Error sending order confirmation email:');
    
    if (error instanceof Error) {
      console.error('- Error name:', error.name);
      console.error('- Error message:', error.message);
      console.error('- Error stack:', error.stack);
    } else {
      console.error('- Unknown error:', error);
    }
    
    // Re-throw with the original error message for better debugging
    throw new Error(`Failed to send confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    console.log('🔍 Verifying email configuration...');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER);
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '[SET]' : '[NOT SET]');
    
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:');
    if (error instanceof Error) {
      console.error('- Error:', error.message);
    }
    return false;
  }
}