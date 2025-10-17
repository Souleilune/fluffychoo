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
              .order-reference-box {
                background: linear-gradient(to right, #4a3828, #5c4a35) !important;
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
                      <div class="order-reference-box" style="text-align: center; margin-bottom: 24px; padding: 16px; background: linear-gradient(to right, #fef3c7, #fde68a); border-radius: 8px;">
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

// Admin notification email template
export function generateAdminOrderNotification(orderDetails: {
  name: string;
  email: string | null;
  order: string;
  quantity: number;
  location: string;
  contactNumber: string;
  orderReference: string;
  paymentProofUrl: string | null;
}) {
  const { name, email, order, quantity, location, contactNumber, orderReference, paymentProofUrl } = orderDetails;
  
  return {
    from: {
      name: 'FluffyChoo Orders',
      address: process.env.EMAIL_USER!,
    },
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER!,
    subject: `New Order: ${orderReference} - ${order}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #fefce8;
            }
            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #1a1410 !important;
              }
              .order-reference-box {
                background: linear-gradient(to right, #4a3828, #5c4a35) !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #fefce8;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fde68a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(to right, #fef9c3, #fde68a); padding: 32px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                         New Order Alert
                      </h1>
                      <p style="margin: 8px 0 0; color: #fef3c7; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        A new order has been placed on FluffyChoo
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      
                      <!-- Order Reference -->
                      <div class="order-reference-box" style="text-align: center; margin-bottom: 24px; padding: 16px; background: linear-gradient(to right, #fef3c7, #fde68a); border-radius: 8px;">
                        <p style="margin: 0 0 4px; color: #1a1410; font-size: 12px; font-weight: 500; font-family: 'Poppins', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                          Order Reference
                        </p>
                        <p style="margin: 0; color: #1a1410; font-size: 24px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                          ${orderReference}
                        </p>
                      </div>

                      <!-- Customer Information -->
                      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px; color: #713f12; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                           Customer Information
                        </h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 6px 0; color: #78350f; font-size: 14px; width: 35%; font-family: 'Poppins', sans-serif;">
                              <strong>Name</strong>
                            </td>
                            <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${name}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              <strong>Contact</strong>
                            </td>
                            <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${contactNumber}
                            </td>
                          </tr>
                          ${email ? `
                          <tr>
                            <td style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              <strong>Email</strong>
                            </td>
                            <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${email}
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                              <strong>Location</strong>
                            </td>
                            <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                              ${location}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Order Details -->
                      <div style="background: linear-gradient(to br, #fef3c7, #fde68a); border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px; color: #713f12; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                           Order Details
                        </h3>
                        
                        <div style="background-color: rgba(255, 255, 255, 0.6); border-radius: 6px; padding: 16px;">
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 6px 0; color: #78350f; font-size: 14px; width: 35%; font-family: 'Poppins', sans-serif;">
                                <strong>Product</strong>
                              </td>
                              <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                                ${order}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <strong>Quantity</strong>
                              </td>
                              <td style="padding: 6px 0; color: #713f12; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                                ${quantity} pcs
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>

                      ${paymentProofUrl ? `
                      <!-- Payment Proof -->
                      <div style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px; color: #166534; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                          Payment Proof Uploaded
                        </h3>
                        <p style="margin: 0 0 12px; color: #15803d; font-size: 14px; font-family: 'Poppins', sans-serif;">
                          Customer has uploaded payment proof. View in admin panel.
                        </p>
                        <a href="${paymentProofUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-family: 'Poppins', sans-serif; font-size: 14px;">
                          View Payment Proof
                        </a>
                      </div>
                      ` : ''}

                      <!-- Quick Actions -->
                      <div style="text-align: center; margin-top: 32px;">
                        <p style="margin: 0 0 16px; color: #78350f; font-size: 14px; font-family: 'Poppins', sans-serif;">
                          Manage this order in your admin panel
                        </p>
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders" target="_blank" style="display: inline-block; padding: 12px 32px; background: linear-gradient(to right, #fef9c3, #fde68a); color: #713f12; text-decoration: none; border-radius: 12px; font-weight: 600; font-family: 'Poppins', sans-serif; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                          Go to Admin Panel
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fef3c7; padding: 20px 24px; text-align: center; border-top: 1px solid #fde68a;">
                      <p style="margin: 0; color: #92400e; font-size: 12px; font-family: 'Poppins', sans-serif;">
                        This is an automated notification from FluffyChoo Order Management System
                      </p>
                      <p style="margin: 4px 0 0; color: #92400e; font-size: 12px; font-family: 'Poppins', sans-serif;">
                        Order received at ${new Date().toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
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
      NEW ORDER NOTIFICATION - FluffyChoo
      
      Order Reference: ${orderReference}
      
      CUSTOMER INFORMATION:
      - Name: ${name}
      - Contact: ${contactNumber}
      ${email ? `- Email: ${email}` : ''}
      - Location: ${location}
      
      ORDER DETAILS:
      - Product: ${order}
      - Quantity: ${quantity}
      
      ${paymentProofUrl ? 'Payment Proof: Uploaded ✓' : 'Payment Proof: Not uploaded'}
      ${paymentProofUrl ? `View: ${paymentProofUrl}` : ''}
      
      Manage this order in your admin panel:
      ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders
      
      Order received at ${new Date().toLocaleString()}
    `,
  };
}

// Send admin notification email
export async function sendAdminOrderNotification(orderDetails: {
  name: string;
  email: string | null;
  order: string;
  quantity: number;
  location: string;
  contactNumber: string;
  orderReference: string;
  paymentProofUrl: string | null;
}) {
  try {
    console.log('📧 Sending admin notification...');
    console.log('- Admin Email:', process.env.ADMIN_EMAIL || process.env.EMAIL_USER);
    console.log('- Order Reference:', orderDetails.orderReference);
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email not configured - skipping admin notification');
      return { success: false, reason: 'Email not configured' };
    }

    const mailOptions = generateAdminOrderNotification(orderDetails);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Admin notification sent successfully!');
    console.log('- Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification:');
    
    if (error instanceof Error) {
      console.error('- Error message:', error.message);
    }
    
    // Don't throw - we don't want to fail the order if notification fails
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}