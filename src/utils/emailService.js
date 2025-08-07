// src/utils/emailService.js
export class EmailService {
  constructor() {
    // Reemplaza esta URL con la URL base de tu backend en Render.
    // Ejemplo: 'https://marianoaliandri-portfolio.onrender.com'
    this.BACKEND_URL = 'https://marianoaliandri-portfolio.onrender.com';
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
      console.error('Error enviando formulario de contacto:', error);
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
      console.error('Error enviando lead de ROI:', error);
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
      console.error('Error enviando web lead:', error);
      throw error;
    }
  }
}