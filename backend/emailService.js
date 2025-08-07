// src/utils/emailService.js
export class EmailService {
  constructor() {
    // Para Netlify Functions, usamos el mismo dominio
    this.API_URL = window.location.origin;
  }

  async sendContactForm(formData) {
    try {
      const response = await fetch(`${this.API_URL}/.netlify/functions/send-contact`, {
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
      const response = await fetch(`${this.API_URL}/.netlify/functions/send-roi-lead`, {
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
      const response = await fetch(`${this.API_URL}/.netlify/functions/send-web-lead`, {
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

  async checkServerHealth() {
    try {
      const response = await fetch(`${this.API_URL}/.netlify/functions/send-contact`, {
        method: 'OPTIONS'
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Exportar instancia global
export const emailService = new EmailService();