const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: (process.env.EMAIL_PORT === '465'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'mock@gmail.com') {
      console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
      return { success: true, message: 'Mock email logged successfully' };
    }
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"HireFlow Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email delivery failed to ${to}: ${error.message}`);
    console.log(`[Failed Email Content] Subject: ${subject}\nHTML: ${html}`);
    return null;
  }
};

const applicationReceivedTemplate = (candidateName, jobTitle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2563eb;">Application Received!</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for applying for the position of <strong>${jobTitle}</strong>. We have received your application and will review it shortly.</p>
    <p>You can track the status of your application from your candidate dashboard.</p>
    <br/>
    <p>Best regards,</p>
    <p>The HireFlow Team</p>
  </div>
`;

const statusUpdateTemplate = (candidateName, jobTitle, newStatus) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2563eb;">Application Status Update</h2>
    <p>Dear ${candidateName},</p>
    <p>The status of your application for <strong>${jobTitle}</strong> has been updated to <strong>${newStatus}</strong>.</p>
    <p>Please log into HireFlow to view any notes from the recruiter.</p>
    <br/>
    <p>Best regards,</p>
    <p>The HireFlow Team</p>
  </div>
`;

const interviewScheduledTemplate = (candidateName, jobTitle, date) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #9333ea;">Interview Scheduled!</h2>
    <p>Dear ${candidateName},</p>
    <p>We are excited to invite you for an interview for the position of <strong>${jobTitle}</strong>.</p>
    <p><strong>Scheduled Date & Time:</strong> ${new Date(date).toLocaleString()}</p>
    <p>Please refer to the recruiter notes on your candidate dashboard for online meeting links or details.</p>
    <br/>
    <p>Best regards,</p>
    <p>The HireFlow Team</p>
  </div>
`;

const recruiterWelcomeTemplate = (recruiterName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #10b981;">Welcome to HireFlow!</h2>
    <p>Dear ${recruiterName},</p>
    <p>We are pleased to inform you that your recruiter account has been approved by the administrator.</p>
    <p>You can now log in, set up your company profile, post jobs, and manage candidate applications.</p>
    <br/>
    <p>Best regards,</p>
    <p>The HireFlow Admin Team</p>
  </div>
`;

const accountSuspensionTemplate = (userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #ef4444;">Account Suspended</h2>
    <p>Dear ${userName},</p>
    <p>We regret to inform you that your HireFlow account has been suspended by the administrator due to policy violations.</p>
    <p>If you believe this is a mistake, please contact support.</p>
    <br/>
    <p>Best regards,</p>
    <p>The HireFlow Admin Team</p>
  </div>
`;

module.exports = {
  sendEmail,
  applicationReceivedTemplate,
  statusUpdateTemplate,
  interviewScheduledTemplate,
  recruiterWelcomeTemplate,
  accountSuspensionTemplate
};
