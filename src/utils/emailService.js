// src/utils/emailService.js
export class EmailService {
  // Enviar formularios directamente a Netlify Forms
  async sendContactForm(formData) {
    try {
      const form = new FormData();
      form.append('form-name', 'contact');
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('message', formData.message);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
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
      const form = new FormData();
      form.append('form-name', 'roi-lead');
      form.append('name', leadData.name);
      form.append('email', leadData.email);
      form.append('phone', leadData.phone || '');
      form.append('company', leadData.company || '');
      form.append('calculationResults', JSON.stringify(leadData.calculationResults || {}));

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
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
      const form = new FormData();
      form.append('form-name', 'web-lead');
      form.append('name', leadData.name);
      form.append('email', leadData.email);
      form.append('phone', leadData.phone || '');
      form.append('calculationResults', JSON.stringify(leadData.calculationResults || {}));

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
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
      const form = new FormData();
      form.append('form-name', 'chatbot-lead');
      form.append('name', leadData.name);
      form.append('email', leadData.email);
      form.append('phone', leadData.phone || '');
      form.append('message', leadData.message || '');

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
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