const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendOrderNotification(orderData) {
    const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, items, transactionId } = orderData;
    
    const itemsList = items.map(item => 
      `• ${item.productName} - Qty: ${item.quantity} - ₹${(parseFloat(item.price) * item.quantity).toFixed(2)}`
    ).join('\n');

    const emailContent = `
New Order Received - Handmade by Tejasree

ORDER DETAILS:
Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone || 'Not provided'}
Address: ${shippingAddress}

PRODUCTS ORDERED:
${itemsList}

PAYMENT:
Transaction ID: ${transactionId}
Total Amount: ₹${totalAmount}

Please process this order and contact the customer for delivery arrangements.
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'admin@handmadebytejasree.com',
      subject: `New Order from ${customerName} - ₹${totalAmount}`,
      text: emailContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Order notification sent to admin');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}

module.exports = EmailService;