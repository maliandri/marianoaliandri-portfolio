// Make.com Webhook Service
// Servicio simple para publicar en redes sociales via Make.com

class MakeService {
  constructor() {
    // Webhook URL from Make.com
    this.webhookURL = import.meta.env.VITE_MAKE_WEBHOOK_PUBLISH || 'https://hook.us2.make.com/qo6w3by4t4fatm8utatt2c54krtyx5nl';
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
        metadata: data.metadata || {}
      };

      const response = await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Make.com webhook error: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Publicación enviada correctamente',
        data: result
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
   * Publicar un producto
   */
  async publishProduct(product) {
    const text = `🎯 Nuevo servicio disponible: ${product.name}

${product.description}

💰 Precio: $${product.price}

¿Te interesa? Contactame:
https://marianoaliandri.com.ar/#contact

#Servicios #DesarrolloWeb #PowerBI #Python`;

    return this.publish({
      text,
      type: 'product',
      metadata: {
        productId: product.id,
        productName: product.name,
        price: product.price
      }
    });
  }

  /**
   * Publicar una estadística del sitio
   */
  async publishStatistic(stat) {
    const text = `📊 ${stat.title}

${stat.description}

${stat.metrics ? Object.entries(stat.metrics).map(([key, value]) => `✅ ${key}: ${value}`).join('\n') : ''}

Conocé más sobre mi trabajo:
https://marianoaliandri.com.ar

#Analytics #DesarrolloWeb #Resultados`;

    return this.publish({
      text,
      type: 'statistic',
      metadata: stat.metrics || {}
    });
  }

  /**
   * Publicar un servicio
   */
  async publishService(service) {
    const text = `💼 ${service.title}

${service.description}

${service.benefits ? service.benefits.map(b => `✅ ${b}`).join('\n') : ''}

¿Necesitás ayuda con esto?
https://marianoaliandri.com.ar/#contact

#Servicios #Consultoría #DesarrolloWeb`;

    return this.publish({
      text,
      type: 'service',
      metadata: {
        serviceId: service.id || service.title,
        serviceName: service.title
      }
    });
  }

  /**
   * Publicar contenido personalizado
   */
  async publishCustom(text, networks = null, imageUrl = null) {
    return this.publish({
      text,
      type: 'custom',
      networks: networks || ['linkedin', 'facebook'],
      imageUrl
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

      const response = await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : 'Error en la conexión'
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
