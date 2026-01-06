// Cloudinary Upload Service
// Servicio para subir imágenes a Cloudinary

class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    this.uploadURL = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }

  /**
   * Subir imagen Base64 a Cloudinary
   * @param {string} base64Image - Imagen en formato Base64 (data:image/...)
   * @param {string} folder - Carpeta en Cloudinary (opcional)
   * @returns {Promise<string>} URL de la imagen en Cloudinary
   */
  async uploadBase64Image(base64Image, folder = 'social-media') {
    try {
      console.log('📤 Subiendo imagen a Cloudinary...');

      const formData = new FormData();
      formData.append('file', base64Image);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(this.uploadURL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error al subir imagen: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Imagen subida exitosamente:', data.secure_url);

      return data.secure_url;
    } catch (error) {
      console.error('❌ Error al subir imagen a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Verificar si una URL es Base64
   * @param {string} url - URL a verificar
   * @returns {boolean} true si es Base64
   */
  isBase64(url) {
    return url && url.startsWith('data:image/');
  }
}

// Exportar instancia única
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
