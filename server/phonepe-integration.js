const crypto = require('crypto');
const axios = require('axios');

class PhonePePayment {
  constructor() {
    // Get these from PhonePe merchant dashboard
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    this.saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  createPaymentRequest(amount, orderId, redirectUrl) {
    const transactionId = this.generateTransactionId();
    
    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: 'USER' + Date.now(),
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: redirectUrl,
      redirectMode: 'POST',
      callbackUrl: redirectUrl,
      mobileNumber: '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = crypto
      .createHash('sha256')
      .update(base64Payload + '/pg/v1/pay' + this.saltKey)
      .digest('hex') + '###' + this.saltIndex;

    return {
      request: base64Payload,
      checksum: checksum,
      transactionId: transactionId,
      payload: payload
    };
  }

  async initiatePayment(amount, orderId, redirectUrl) {
    try {
      const { request, checksum, transactionId } = this.createPaymentRequest(amount, orderId, redirectUrl);
      
      const response = await axios.post(`${this.baseUrl}/pg/v1/pay`, {
        request: request
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId
        };
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyPayment(transactionId, checksum) {
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(`/pg/v1/status/${this.merchantId}/${transactionId}` + this.saltKey)
      .digest('hex') + '###' + this.saltIndex;
    
    return checksum === expectedChecksum;
  }
}

module.exports = PhonePePayment;