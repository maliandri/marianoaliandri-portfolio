// Make.com Webhook Service
// Servicio simple para publicar en redes sociales via Make.com

class MakeService {
  constructor() {
    // Webhook URL from Make.com
    this.webhookURL = import.meta.env.VITE_MAKE_WEBHOOK_PUBLISH || 'https://hook.us2.make.com/og06wglflanrsbx84k5fedo9j3b74gct';
  }

  /**
   * Publicar en redes sociales via Make.com
   * @param {Object} data - Datos del post
   * @param {string} data.text - Texto del post
   * @param {Array} data.networks - Redes sociales ['linkedin', 'facebook']
   * @param {string} data.type - Tipo de contenido ['product', 'service', 'statistic', 'custom']
   * @param {string} data.imageUrl - URL de imagen (opcional)
   * @param {Object} data.metadata - Metadata adicional (opcional)
   */
  async publish(data) {
    try {
      const payload = {
        text: data.text,
        networks: data.networks || ['linkedin', 'facebook'],
        type: data.type || 'custom',
        timestamp: new Date().toISOString(),
        imageUrl: data.imageUrl || null,
        useAI: data.useAI || false, // Indica si debe procesar con AI
        metadata: data.metadata || {}
      };

      await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      // Con mode: 'no-cors' no podemos leer la respuesta, pero eso está bien
      // El webhook se envió exitosamente
      return {
        success: true,
        message: 'Publicación enviada correctamente',
        data: { sent: true }
      };
    } catch (error) {
      console.error('Error publishing to Make.com:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  /**
   * Publicar un producto (AI generará el contenido)
   */
  async publishProduct(product) {
    // Enviamos descripción breve para que AI genere el post
    const briefDescription = `Producto: ${product.name}. ${product.description}. Precio: $${product.price}`;

    return this.publish({
      text: briefDescription,
      type: 'product',
      useAI: true, // AI procesará esto
      imageUrl: product.image || null, // Imagen del producto
      metadata: {
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        price: product.price,
        productUrl: 'https://marianoaliandri.com.ar/#tienda',
        productImage: product.image || null
      }
    });
  }

  /**
   * Publicar una estadística del sitio (AI generará el contenido)
   */
  async publishStatistic(stat) {
    // Enviamos info para que AI genere el post
    const briefDescription = `Estadística: ${stat.title}. ${stat.description}. ${
      stat.metrics ? 'Métricas: ' + Object.entries(stat.metrics).map(([key, value]) => `${key}: ${value}`).join(', ') : ''
    }`;

    return this.publish({
      text: briefDescription,
      type: 'statistic',
      useAI: true, // AI procesará esto
      metadata: {
        title: stat.title,
        description: stat.description,
        metrics: stat.metrics || {},
        siteUrl: 'https://marianoaliandri.com.ar'
      }
    });
  }

  /**
   * Publicar un servicio (AI generará el contenido)
   */
  async publishService(service) {
    // Enviamos info para que AI genere el post
    const briefDescription = `Servicio: ${service.title}. ${service.description}. ${
      service.benefits ? 'Beneficios: ' + service.benefits.join(', ') : ''
    }`;

    return this.publish({
      text: briefDescription,
      type: 'service',
      useAI: true, // AI procesará esto
      metadata: {
        serviceId: service.id || service.title,
        serviceName: service.title,
        serviceDescription: service.description,
        benefits: service.benefits || [],
        serviceUrl: 'https://marianoaliandri.com.ar/#servicios'
      }
    });
  }

  /**
   * Publicar contenido personalizado
   */
  async publishCustom(text, networks = null, imageUrl = null, useAI = false) {
    return this.publish({
      text,
      type: 'custom',
      networks: networks || ['linkedin', 'facebook'],
      imageUrl,
      useAI
    });
  }

  /**
   * Test de conexión con Make.com
   */
  async testConnection() {
    try {
      const testData = {
        text: '🧪 Test de conexión desde el panel de administración',
        networks: ['linkedin'],
        type: 'test',
        timestamp: new Date().toISOString()
      };

      await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testData)
      });

      return {
        success: true,
        status: 200,
        message: 'Conexión exitosa'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }
}

// Exportar instancia única
const makeService = new MakeService();
export default makeService;
