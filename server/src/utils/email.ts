import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (template: string, data: any): { html: string; text: string } => {
  switch (template) {
    case 'booking-confirmation':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Booking Confirmation</h2>
            <p>Dear ${data.booking.contactInfo.name},</p>
            <p>Your booking for <strong>${data.temple.name}</strong> has been confirmed!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Temple:</strong> ${data.temple.name}</p>
              <p><strong>Date:</strong> ${data.booking.formattedVisitDate}</p>
              <p><strong>Time:</strong> ${data.booking.timeSlot.start} - ${data.booking.timeSlot.end}</p>
              <p><strong>Visitors:</strong> ${data.booking.totalVisitors}</p>
              <p><strong>Amount:</strong> ₹${data.booking.finalAmount}</p>
              <p><strong>Booking Reference:</strong> ${data.booking.bookingReference}</p>
            </div>
            
            <p>Please show this QR code at the temple entrance:</p>
            <img src="${data.qrCode}" alt="QR Code" style="max-width: 200px;" />
            
            <p>Thank you for choosing DivyaYatri!</p>
          </div>
        `,
        text: `
          Booking Confirmation
          
          Dear ${data.booking.contactInfo.name},
          
          Your booking for ${data.temple.name} has been confirmed!
          
          Booking Details:
          Temple: ${data.temple.name}
          Date: ${data.booking.formattedVisitDate}
          Time: ${data.booking.timeSlot.start} - ${data.booking.timeSlot.end}
          Visitors: ${data.booking.totalVisitors}
          Amount: ₹${data.booking.finalAmount}
          Booking Reference: ${data.booking.bookingReference}
          
          Thank you for choosing DivyaYatri!
        `
      };
      
    case 'booking-cancelled':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Booking Cancelled</h2>
            <p>Dear ${data.booking.contactInfo.name},</p>
            <p>Your booking for <strong>${data.temple?.name || 'the temple'}</strong> has been cancelled.</p>
            
            ${data.refundAmount > 0 ? `
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Refund Information</h3>
                <p><strong>Refund Amount:</strong> ₹${data.refundAmount}</p>
                <p>Your refund will be processed within 3-5 business days.</p>
              </div>
            ` : ''}
            
            <p>We're sorry to see you go. Feel free to book again anytime!</p>
          </div>
        `,
        text: `
          Booking Cancelled
          
          Dear ${data.booking.contactInfo.name},
          
          Your booking has been cancelled.
          
          ${data.refundAmount > 0 ? `Refund Amount: ₹${data.refundAmount}\nYour refund will be processed within 3-5 business days.` : ''}
          
          We're sorry to see you go. Feel free to book again anytime!
        `
      };
      
    default:
      return {
        html: '<p>Email template not found</p>',
        text: 'Email template not found'
      };
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    const { html, text } = getEmailTemplate(options.template, options.data);
    
    const mailOptions = {
      from: `"DivyaYatri" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html,
      text,
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};