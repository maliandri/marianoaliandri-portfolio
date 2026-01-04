// Reel Generation Service
// Genera videos cortos (reels) desde imágenes de productos usando Cloudinary

class ReelService {
  constructor() {
    this.cloudName = 'dlshym1te';
  }

  /**
   * Generar URL de video (reel) desde una imagen de Cloudinary
   * @param {string} imageUrl - URL de la imagen del producto
   * @param {Object} options - Opciones de generación
   * @returns {string} URL del video generado
   */
  generateReelFromImage(imageUrl, options = {}) {
    // Extraer el public ID de la URL de Cloudinary
    const publicId = this.extractPublicId(imageUrl);

    if (!publicId) {
      console.error('No se pudo extraer el public ID de la imagen:', imageUrl);
      return null;
    }

    const {
      duration = 10, // Duración en segundos
      width = 1080,
      height = 1920, // Formato vertical para reels (9:16)
      productName = '',
      price = '',
      overlay = true
    } = options;

    // Construir transformaciones de Cloudinary para convertir imagen en video
    const transformations = [
      // 1. Dimensiones verticales para reels
      `w_${width},h_${height},c_fill,g_center`,

      // 2. Efecto de zoom suave
      'e_zoompan:mode_zp;maxzoom_1.5;du_' + duration,

      // 3. Overlay de texto con el nombre del producto (si existe)
      overlay && productName ? `l_text:Arial_100_bold:${encodeURIComponent(productName)},co_rgb:ffffff,g_north,y_150` : '',

      // 4. Overlay del precio (si existe)
      overlay && price ? `l_text:Arial_80:${encodeURIComponent(price)},co_rgb:00ff00,g_south,y_150` : '',

      // 5. Efecto de fade in/out
      'e_fade:2000'
    ].filter(Boolean).join('/');

    // URL del video generado
    const videoUrl = `https://res.cloudinary.com/${this.cloudName}/video/upload/${transformations}/${publicId}.mp4`;

    return videoUrl;
  }

  /**
   * Extraer el public ID de una URL de Cloudinary
   * Ejemplo: https://res.cloudinary.com/dlshym1te/image/upload/c_fill,w_400,h_300,f_auto,q_auto/v1765836744/ecommerce.webp
   * Extrae: v1765836744/ecommerce
   */
  extractPublicId(imageUrl) {
    try {
      // Buscar el patrón /upload/.../.../[public_id].extension
      const match = imageUrl.match(/\/upload\/(?:.*\/)?(v\d+\/[^.]+)/);
      if (match && match[1]) {
        return match[1];
      }

      // Intentar otro patrón sin versión
      const match2 = imageUrl.match(/\/upload\/(?:.*\/)?([^/.]+)\.\w+$/);
      if (match2 && match2[1]) {
        return match2[1];
      }

      return null;
    } catch (error) {
      console.error('Error extrayendo public ID:', error);
      return null;
    }
  }

  /**
   * Generar metadata para el reel (para enviar a Make.com)
   * @param {Object} product - Datos del producto
   * @returns {Object} Metadata del reel
   */
  generateReelMetadata(product) {
    const videoUrl = this.generateReelFromImage(product.image, {
      productName: product.name,
      price: product.priceARS ? `ARS $${product.priceARS}` : product.priceUSD ? `USD $${product.priceUSD}` : '',
      duration: 10
    });

    return {
      videoUrl,
      type: 'reel',
      productId: product.id,
      productName: product.name,
      duration: 10,
      format: 'vertical', // 9:16
      width: 1080,
      height: 1920
    };
  }
}

// Exportar instancia única
const reelService = new ReelService();
export default reelService;
