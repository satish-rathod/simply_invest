import nodemailer from 'nodemailer';

// Email configuration
let transporter;

// Initialize email transporter
const initEmailTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration (use your email service)
    transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use ethereal email for testing
    transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Send email function
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      initEmailTransporter();
    }

    // If no email configuration, log instead
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'placeholder-email-user') {
      console.log('📧 EMAIL NOTIFICATION (No email config):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      return { success: true, message: 'Email logged (no configuration)' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@simplyinvest.com',
      to,
      subject,
      text,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Simply Invest
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">${subject}</h3>
            <p style="color: #333; line-height: 1.6;">${text}</p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from Simply Invest. If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Simply Invest!';
  const text = `
    Hi ${name},

    Welcome to Simply Invest! We're excited to help you on your investment journey.

    Here's what you can do with your account:
    - Track your investment portfolio
    - Get real-time market data and analysis
    - Set up price alerts for your favorite stocks
    - Chat with our AI financial advisor
    - Access daily stock recommendations

    Get started by exploring the dashboard and adding your first stocks to your portfolio.

    Happy investing!
    The Simply Invest Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        Welcome to Simply Invest!
      </h2>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #007bff; margin-top: 0;">Hi ${name},</h3>
        <p style="color: #333; line-height: 1.6;">
          Welcome to Simply Invest! We're excited to help you on your investment journey.
        </p>
        <h4 style="color: #333; margin-top: 20px;">Here's what you can do with your account:</h4>
        <ul style="color: #333; line-height: 1.6;">
          <li>Track your investment portfolio</li>
          <li>Get real-time market data and analysis</li>
          <li>Set up price alerts for your favorite stocks</li>
          <li>Chat with our AI financial advisor</li>
          <li>Access daily stock recommendations</li>
        </ul>
        <p style="color: #333; line-height: 1.6;">
          Get started by exploring the dashboard and adding your first stocks to your portfolio.
        </p>
        <p style="color: #333; line-height: 1.6;">
          Happy investing!<br>
          The Simply Invest Team
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};

// Send alert notification
export const sendAlertNotification = async (to, alertType, symbol, message) => {
  const subject = `🚨 Price Alert: ${symbol}`;
  const text = `
    Alert Triggered: ${alertType}
    Symbol: ${symbol}
    
    ${message}
    
    Login to your Simply Invest account to view more details and manage your alerts.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
        🚨 Price Alert Triggered
      </h2>
      <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">Alert: ${alertType}</h3>
        <p style="color: #856404; font-size: 18px; font-weight: bold;">Symbol: ${symbol}</p>
        <p style="color: #856404; line-height: 1.6;">${message}</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">
          Login to your Simply Invest account to view more details and manage your alerts.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};

// Send portfolio summary email
export const sendPortfolioSummary = async (to, name, portfolioData) => {
  const subject = 'Your Portfolio Summary';
  const { totalValue, totalGainLoss, totalGainLossPercent, topPerformers } = portfolioData;
  
  const text = `
    Hi ${name},

    Here's your portfolio summary:

    Total Value: $${totalValue?.toFixed(2) || '0.00'}
    Total Gain/Loss: $${totalGainLoss?.toFixed(2) || '0.00'} (${totalGainLossPercent?.toFixed(2) || '0.00'}%)

    Top Performers:
    ${topPerformers?.map(p => `${p.symbol}: ${p.gainLossPercent?.toFixed(2) || '0.00'}%`).join('\n') || 'No data available'}

    Login to your account for detailed analysis and recommendations.

    Happy investing!
    The Simply Invest Team
  `;

  return await sendEmail(to, subject, text);
};