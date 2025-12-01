// src/utils/emailService.js
export class EmailService {
  // Enviar formularios directamente a Netlify Forms
  async sendContactForm(formData) {
    try {
      const params = new URLSearchParams();
      params.append('form-name', 'contact');
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('message', formData.message);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, message: 'Formulario enviado correctamente' };
    } catch (error) {
      console.error('Error sending contact form:', error);
      throw error;
    }
  }

  async sendROILead(leadData) {
    try {
      const params = new URLSearchParams();
      params.append('form-name', 'roi-lead');
      params.append('name', leadData.name);
      params.append('email', leadData.email);
      params.append('phone', leadData.phone || '');
      params.append('company', leadData.company || '');
      params.append('calculationResults', JSON.stringify(leadData.calculationResults || {}));

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, message: 'Lead ROI enviado correctamente' };
    } catch (error) {
      console.error('Error sending ROI lead:', error);
      throw error;
    }
  }

  async sendWebLead(leadData) {
    try {
      const params = new URLSearchParams();
      params.append('form-name', 'web-lead');
      params.append('name', leadData.name);
      params.append('email', leadData.email);
      params.append('phone', leadData.phone || '');
      params.append('calculationResults', JSON.stringify(leadData.calculationResults || {}));

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, message: 'Lead Web enviado correctamente' };
    } catch (error) {
      console.error('Error sending web lead:', error);
      throw error;
    }
  }

  async sendChatbotLead(leadData) {
    try {
      const params = new URLSearchParams();
      params.append('form-name', 'chatbot-lead');
      params.append('name', leadData.name);
      params.append('email', leadData.email);
      params.append('phone', leadData.phone || '');
      params.append('message', leadData.message || '');

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true, message: 'Lead del chatbot enviado correctamente' };
    } catch (error) {
      console.error('Error sending chatbot lead:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();