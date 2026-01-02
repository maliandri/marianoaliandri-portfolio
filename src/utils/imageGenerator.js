/**
 * Image Generator for Social Media Posts
 * Genera imágenes automáticas para compartir en redes sociales
 */

import { toPng, toJpeg } from 'html-to-image';

class ImageGenerator {
  /**
   * Genera una imagen de proyecto para compartir en redes
   */
  async generateProjectImage(project) {
    const container = this.createProjectCard(project);
    return await this.convertToImage(container);
  }

  /**
   * Genera una imagen de calculadora
   */
  async generateCalculatorImage(calculatorType, stats = {}) {
    const container = this.createCalculatorCard(calculatorType, stats);
    return await this.convertToImage(container);
  }

  /**
   * Genera una imagen de testimonio
   */
  async generateTestimonialImage(testimonial) {
    const container = this.createTestimonialCard(testimonial);
    return await this.convertToImage(container);
  }

  /**
   * Genera quote card genérica
   */
  async generateQuoteImage(quote, author) {
    const container = this.createQuoteCard(quote, author);
    return await this.convertToImage(container);
  }

  /**
   * Crea el HTML de una tarjeta de proyecto
   */
  createProjectCard(project) {
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.height = '630px';
    container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    container.style.padding = '60px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    container.innerHTML = `
      <div style="position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        <!-- Header -->
        <div>
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              🚀
            </div>
            <div>
              <h3 style="color: white; font-size: 24px; margin: 0; opacity: 0.9;">Nuevo Proyecto</h3>
              <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin: 5px 0 0 0;">Mariano Aliandri</p>
            </div>
          </div>

          <!-- Título del proyecto -->
          <h1 style="color: white; font-size: 56px; font-weight: 800; margin: 0 0 30px 0; line-height: 1.2;">
            ${project.title || 'Nuevo Proyecto'}
          </h1>

          <!-- Descripción -->
          <p style="color: rgba(255,255,255,0.95); font-size: 28px; line-height: 1.6; margin: 0; max-width: 900px;">
            ${project.description || ''}
          </p>
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 15px;">
            ${this.generateTechBadges(project.technologies || [])}
          </div>
          <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 15px 30px; border-radius: 50px;">
            <p style="color: white; font-size: 20px; margin: 0; font-weight: 600;">marianoaliandri.com.ar</p>
          </div>
        </div>
      </div>

      <!-- Background decoration -->
      <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1;"></div>
      <div style="position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(255,255,255,0.05); border-radius: 50%; z-index: 1;"></div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Crea el HTML de una tarjeta de calculadora
   */
  createCalculatorCard(calculatorType, stats) {
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.height = '630px';
    container.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    container.style.padding = '60px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.position = 'relative';

    const titles = {
      roi: 'Calculadora de ROI',
      web: 'Calculadora Web',
      ats: 'Analizador ATS'
    };

    const descriptions = {
      roi: 'Calcula el retorno de inversión de tu proyecto web',
      web: 'Estima el costo de desarrollo de tu sitio web',
      ats: 'Optimiza tu CV para sistemas de tracking'
    };

    const icons = {
      roi: '📈',
      web: '💻',
      ats: '📄'
    };

    container.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 40px;">
            <div style="width: 100px; height: 100px; background: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
              ${icons[calculatorType] || '🧮'}
            </div>
          </div>

          <h1 style="color: white; font-size: 64px; font-weight: 800; margin: 0 0 20px 0;">
            ${titles[calculatorType] || 'Calculadora'}
          </h1>

          <p style="color: rgba(255,255,255,0.95); font-size: 32px; margin: 0 0 40px 0;">
            ${descriptions[calculatorType] || ''}
          </p>

          ${stats.totalCalculations ? `
            <div style="display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px 40px; border-radius: 15px;">
              <p style="color: white; font-size: 24px; margin: 0;">
                <span style="font-size: 48px; font-weight: 800;">${stats.totalCalculations}</span><br/>
                empresas ya lo probaron
              </p>
            </div>
          ` : ''}
        </div>

        <div>
          <div style="background: white; padding: 25px 40px; border-radius: 15px; display: inline-block;">
            <p style="color: #f5576c; font-size: 28px; margin: 0; font-weight: 700;">
              Probalo gratis → marianoaliandri.com.ar
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Crea el HTML de una tarjeta de testimonio
   */
  createTestimonialCard(testimonial) {
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.height = '630px';
    container.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    container.style.padding = '80px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';

    container.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 120px; color: rgba(255,255,255,0.3); line-height: 0; margin-bottom: 30px;">"</div>

        <div>
          <p style="color: white; font-size: 40px; line-height: 1.5; margin: 0 0 40px 0; font-weight: 500;">
            ${testimonial.text || ''}
          </p>

          <div style="display: flex; align-items: center; gap: 20px;">
            ${testimonial.image ? `
              <img src="${testimonial.image}" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid white;" />
            ` : `
              <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: #4facfe;">
                ${testimonial.author?.charAt(0) || 'T'}
              </div>
            `}
            <div>
              <p style="color: white; font-size: 28px; margin: 0; font-weight: 700;">
                ${testimonial.author || 'Cliente'}
              </p>
              <p style="color: rgba(255,255,255,0.8); font-size: 22px; margin: 5px 0 0 0;">
                ${testimonial.role || testimonial.company || ''}
              </p>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <p style="color: rgba(255,255,255,0.9); font-size: 24px; margin: 0; font-weight: 600;">
            Mariano Aliandri | Full Stack Developer
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Crea el HTML de una quote card
   */
  createQuoteCard(quote, author) {
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.height = '630px';
    container.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    container.style.padding = '80px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.textAlign = 'center';

    container.innerHTML = `
      <p style="color: white; font-size: 48px; line-height: 1.4; margin: 0 0 40px 0; font-weight: 600; max-width: 1000px;">
        ${quote}
      </p>
      <p style="color: rgba(255,255,255,0.9); font-size: 32px; margin: 0; font-weight: 700;">
        — ${author}
      </p>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Genera badges de tecnologías
   */
  generateTechBadges(technologies) {
    return technologies.slice(0, 4).map(tech => `
      <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 25px;">
        <p style="color: white; font-size: 18px; margin: 0; font-weight: 600;">${tech}</p>
      </div>
    `).join('');
  }

  /**
   * Convierte el contenedor HTML a imagen
   */
  async convertToImage(container, format = 'png') {
    try {
      const converter = format === 'jpeg' ? toJpeg : toPng;

      const dataUrl = await converter(container, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Remover el contenedor del DOM
      document.body.removeChild(container);

      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      throw error;
    }
  }

  /**
   * Descarga la imagen generada
   */
  downloadImage(dataUrl, filename = 'share-image.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Convierte data URL a Blob para subir a Buffer
   */
  dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
}

// Singleton instance
const imageGenerator = new ImageGenerator();

export default imageGenerator;
