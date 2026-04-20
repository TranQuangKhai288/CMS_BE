import nodemailer from 'nodemailer';
import envConfig from '@config/env.config';
import logger from '@common/utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  private initialize() {
    try {
      const smtpUser = envConfig.get('SMTP_USER');
      const smtpPass = envConfig.get('SMTP_PASS');

      // Check if SMTP is configured
      if (!smtpUser || !smtpPass) {
        logger.warn('SMTP credentials not configured. Email service disabled.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: envConfig.get('SMTP_HOST'),
        port: envConfig.get('SMTP_PORT'),
        secure: envConfig.get('SMTP_SECURE'),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: options.from || envConfig.get('EMAIL_FROM'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào mừng đến với cms</h1>
          </div>
          <div class="content">
            <p>Xin chào ${name},</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản! Chúng tôi rất vui được chào đón bạn.</p>
            <p>Bạn đã có thể bắt đầu sử dụng hệ thống quản lý của chúng tôi.</p>
            <a href="#" class="button">Bắt đầu ngay</a>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Đội ngũ cms</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: email,
      subject: 'Chào mừng bạn đến với cms',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, name: string): Promise<boolean> {
    const resetUrl = `${envConfig.get('CORS_ORIGIN')}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào ${name},</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            <div class="warning">
              <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </div>
            <p>Hoặc copy link sau vào trình duyệt:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            <p>Trân trọng,<br>Đội ngũ cms</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: email,
      subject: 'Đặt lại mật khẩu - cms',
      html,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    customerName: string,
    total: number,
    items: any[]
  ): Promise<boolean> {
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toLocaleString('vi-VN')} ₫</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #10b981; text-align: right; padding: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Đơn hàng đã được xác nhận</h1>
          </div>
          <div class="content">
            <p>Xin chào ${customerName},</p>
            <p>Cảm ơn bạn đã đặt hàng! Đơn hàng <strong>#${orderNumber}</strong> của bạn đã được xác nhận.</p>
            
            <h3>Chi tiết đơn hàng:</h3>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th style="text-align: center;">Số lượng</th>
                  <th style="text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">Tổng cộng: ${total.toLocaleString('vi-VN')} ₫</div>
            
            <p>Chúng tôi sẽ gửi email thông báo khi đơn hàng được giao.</p>
            <p>Trân trọng,<br>Đội ngũ cms</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: email,
      subject: `Xác nhận đơn hàng #${orderNumber}`,
      html,
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    email: string,
    orderNumber: string,
    customerName: string,
    status: string
  ): Promise<boolean> {
    const statusMap: Record<string, { title: string; message: string; color: string }> = {
      CONFIRMED: {
        title: 'Đơn hàng đã được xác nhận',
        message: 'Đơn hàng của bạn đã được xác nhận và đang được xử lý.',
        color: '#3b82f6',
      },
      PROCESSING: {
        title: 'Đơn hàng đang được xử lý',
        message: 'Chúng tôi đang chuẩn bị đơn hàng của bạn.',
        color: '#f59e0b',
      },
      SHIPPED: {
        title: 'Đơn hàng đang được giao',
        message: 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.',
        color: '#8b5cf6',
      },
      DELIVERED: {
        title: 'Đơn hàng đã được giao',
        message: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
        color: '#10b981',
      },
      CANCELLED: {
        title: 'Đơn hàng đã bị hủy',
        message: 'Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.',
        color: '#ef4444',
      },
    };

    const statusInfo = statusMap[status] || statusMap.CONFIRMED;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusInfo.color}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.title}</h1>
          </div>
          <div class="content">
            <p>Xin chào ${customerName},</p>
            <p>${statusInfo.message}</p>
            <p><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
            <p>Trân trọng,<br>Đội ngũ cms</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: email,
      subject: `Cập nhật đơn hàng #${orderNumber} - ${statusInfo.title}`,
      html,
    });
  }

  /**
   * Verify email configuration
   */
  async verify(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed:', error);
      return false;
    }
  }
}

const emailService = new EmailService();
export default emailService;
