// src/utils/emailService.js
export class EmailService {
  constructor() {
    this.BACKEND_URL = 'https://marianoaliandri-portfolio.onrender.com'; // <--- PEGA AQUÍ LA URL DE RENDER
  }

  async sendContactForm(formData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending contact form:', error);
      throw error;
    }
  }

  async sendROILead(leadData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/send-roi-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending ROI lead:', error);
      throw error;
    }
  }

  async sendWebLead(leadData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/send-web-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending web lead:', error);
      throw error;
    }
  }

  async sendChatbotLead(leadData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/send-chatbot-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending chatbot lead:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();