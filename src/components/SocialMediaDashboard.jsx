import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import makeService from '../utils/makeService';
import reelService from '../utils/reelService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseservice';
import ReelEditor from './ReelEditor';

/**
 * Social Media Dashboard - Make.com Integration
 * Panel simplificado para publicar en redes sociales via webhooks
 */
function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState('custom'); // custom, products, services, statistics
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Custom post state
  const [postText, setPostText] = useState('');
  const [selectedNetworks, setSelectedNetworks] = useState(['linkedin', 'facebook']);
  const [useAI, setUseAI] = useState(false); // Toggle para usar AI
  const [customImageUrl, setCustomImageUrl] = useState(''); // URL de imagen para publicación libre

  // Products state
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReelEditor, setShowReelEditor] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    title: '',
    description: '',
    metrics: {},
    imageUrl: '' // URL de imagen para estadística
  });

  const networks = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
    { id: 'facebook', name: 'Facebook + Instagram', icon: '👥📷', color: 'bg-blue-700', info: 'Publica en Facebook e Instagram automáticamente' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('📦 SocialMediaDashboard - Productos cargados desde Firebase:', productsData);
      console.log('📦 Total de productos:', productsData.length);
      // Log del producto portfolio específicamente
      const portfolio = productsData.find(p => p.id === 'portfolio');
      if (portfolio) {
        console.log('🎯 Producto Portfolio encontrado:', portfolio);
        console.log('🖼️ Portfolio.image:', portfolio.image);
      }
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const toggleNetwork = (networkId) => {
    setSelectedNetworks(prev =>
      prev.includes(networkId)
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    );
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Manejar pegado de imagen desde clipboard
  const handlePaste = async (e, setImageFn) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();

        reader.onloadend = () => {
          setImageFn(reader.result); // Base64 data URL
          showMessage('success', '📋 Imagen pegada correctamente');
        };

        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // Manejar carga de archivo de imagen
  const handleFileUpload = async (e, setImageFn) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Por favor selecciona un archivo de imagen');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFn(reader.result); // Base64 data URL
      showMessage('success', '📷 Imagen cargada correctamente');
    };

    reader.readAsDataURL(file);
  };

  const handlePublishCustom = async () => {
    if (!postText.trim()) {
      showMessage('error', 'Por favor escribe algo para publicar');
      return;
    }

    if (selectedNetworks.length === 0) {
      showMessage('error', 'Selecciona al menos una red social');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await makeService.publishCustom(postText, selectedNetworks, customImageUrl || null, useAI);

      if (result.success) {
        showMessage('success', useAI ? '¡Contenido enviado a AI para generar y publicar!' : '¡Publicación enviada correctamente!');
        setPostText('');
        setCustomImageUrl('');
      } else {
        showMessage('error', `Error: ${result.message}`);
      }
    } catch (error) {
      showMessage('error', 'Error al publicar');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishProduct = async () => {
    if (!selectedProduct) {
      showMessage('error', 'Selecciona un producto');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await makeService.publishProduct(selectedProduct);

      if (result.success) {
        showMessage('success', '✨ ¡AI generando contenido del producto y publicando en redes sociales!');
        setSelectedProduct(null);
      } else {
        showMessage('error', `Error: ${result.message}`);
      }
    } catch (error) {
      showMessage('error', 'Error al publicar producto');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishReel = async () => {
    if (!selectedProduct) {
      showMessage('error', 'Selecciona un producto');
      return;
    }

    if (!selectedProduct.image) {
      showMessage('error', 'El producto necesita una imagen para generar el reel');
      return;
    }

    // Abrir el editor visual
    setShowReelEditor(true);
  };

  const handleReelPublish = async (videoUrl) => {
    try {
      setIsPublishing(true);
      showMessage('info', '📤 Publicando reel en redes sociales...');

      // Publicar el reel con AI caption
      const result = await makeService.publishReel(selectedProduct, videoUrl);

      if (result.success) {
        showMessage('success', '🎬 ¡Reel publicado exitosamente en Instagram!');
        setSelectedProduct(null);
        setShowReelEditor(false);
      } else {
        showMessage('error', `Error al publicar: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al publicar reel:', error);
      showMessage('error', `Error: ${error.message || 'Error al publicar reel'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishStatistic = async () => {
    if (!stats.title || !stats.description) {
      showMessage('error', 'Completa título y descripción');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await makeService.publishStatistic(stats);

      if (result.success) {
        showMessage('success', '✨ ¡AI generando contenido de la estadística y publicando en redes sociales!');
        setStats({ title: '', description: '', metrics: {} });
      } else {
        showMessage('error', `Error: ${result.message}`);
      }
    } catch (error) {
      showMessage('error', 'Error al publicar estadística');
    } finally {
      setIsPublishing(false);
    }
  };

  const testConnection = async () => {
    setIsPublishing(true);
    try {
      const result = await makeService.testConnection();

      if (result.success) {
        showMessage('success', 'Conexión exitosa con Make.com');
      } else {
        showMessage('error', `Error de conexión: ${result.message}`);
      }
    } catch (error) {
      showMessage('error', 'Error al probar conexión');
    } finally {
      setIsPublishing(false);
    }
  };

  const tabs = [
    { id: 'custom', label: 'Publicación Libre', icon: '✍️' },
    { id: 'products', label: 'Productos/Servicios', icon: '🎯' },
    { id: 'statistics', label: 'Estadísticas', icon: '📊' }
  ];

  const templates = {
    service: `💼 ¿Sabías que puedo ayudarte con [servicio]?

✅ [Beneficio 1]
✅ [Beneficio 2]
✅ [Beneficio 3]

Conocé más:
https://marianoaliandri.com.ar

#Servicios #DesarrolloWeb #PowerBI`,

    tip: `💡 Tip profesional:

[Tu consejo aquí]

¿Necesitás ayuda con esto?
https://marianoaliandri.com.ar/#contact

#Tech #Programming #WebDev`,

    achievement: `🎉 ¡Nuevo logro desbloqueado!

[Descripción del logro]

Gracias a todos por el apoyo.

#DesarrolloWeb #Resultados #Éxito`
  };

  const useTemplate = (template) => {
    setPostText(templates[template]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Redes Sociales
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Publica en tus redes sociales via Make.com
          </p>
        </div>
        <button
          onClick={testConnection}
          disabled={isPublishing}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          🔌 Test Conexión
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Network Selector (visible in all tabs) */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Redes Sociales
        </h3>
        <div className="flex flex-wrap gap-2">
          {networks.map(network => (
            <button
              key={network.id}
              onClick={() => toggleNetwork(network.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedNetworks.includes(network.id)
                  ? `${network.color} text-white`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={network.info || network.name}
            >
              {network.icon} {network.name}
            </button>
          ))}
        </div>
        {selectedNetworks.includes('facebook') && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Facebook + Instagram:</strong> Si tienes conectado Facebook a Instagram, el post se publicará automáticamente en ambas redes.
            </p>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          {/* Templates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Templates Rápidos
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => useTemplate('service')}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
              >
                💼 Servicio
              </button>
              <button
                onClick={() => useTemplate('tip')}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
              >
                💡 Tip
              </button>
              <button
                onClick={() => useTemplate('achievement')}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
              >
                🎉 Logro
              </button>
            </div>
          </div>

          {/* AI Toggle */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  ✨ Modo AI-Powered
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {useAI
                    ? 'Gemini generará un post profesional basado en tu descripción'
                    : 'Publica tu texto tal como está'}
                </p>
              </div>
              <button
                onClick={() => setUseAI(!useAI)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  useAI ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    useAI ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Composer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {useAI ? 'Descripción Breve (AI generará el contenido)' : 'Texto del Post'}
            </label>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={useAI ? 4 : 10}
              placeholder={useAI
                ? 'Ej: "Acabo de lanzar un nuevo servicio de consultoría en Power BI para empresas que quieren mejorar sus dashboards"'
                : 'Escribe tu publicación aquí...'}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {postText.length} caracteres
            </div>
          </div>

          <button
            onClick={handlePublishCustom}
            disabled={isPublishing || !postText.trim()}
            className={`w-full py-3 ${
              useAI
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPublishing
              ? '⏳ Procesando...'
              : useAI
                ? '✨ Generar con AI y Publicar'
                : '🚀 Publicar Ahora'}
          </button>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Producto/Servicio
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === e.target.value);
                setSelectedProduct(product);
              }}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Seleccionar --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.priceARS ? `ARS ${product.priceARS}` : product.priceUSD ? `USD ${product.priceUSD}` : 'Consultar'}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Vista Previa
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {`🎯 Nuevo servicio disponible: ${selectedProduct.name}

${selectedProduct.description}

💰 Precio: ${selectedProduct.priceARS ? `ARS $${selectedProduct.priceARS}` : selectedProduct.priceUSD ? `USD $${selectedProduct.priceUSD}` : 'Consultar'}

¿Te interesa? Contactame:
https://marianoaliandri.com.ar/#contact

#Servicios #DesarrolloWeb #PowerBI #Python`}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePublishProduct}
              disabled={isPublishing || !selectedProduct}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? '⏳ Publicando...' : '🚀 Post'}
            </button>
            <button
              onClick={handlePublishReel}
              disabled={isPublishing || !selectedProduct}
              className="py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? '⏳ Generando...' : '🎬 Reel'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={stats.title}
              onChange={(e) => setStats({ ...stats, title: e.target.value })}
              placeholder="Ej: Alcanzamos 10,000 visitantes"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={stats.description}
              onChange={(e) => setStats({ ...stats, description: e.target.value })}
              rows={4}
              placeholder="Descripción de la estadística..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Métricas (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Visitantes: 10,000"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const [key, value] = e.target.value.split(':');
                  if (key && value) {
                    setStats({
                      ...stats,
                      metrics: { ...stats.metrics, [key.trim()]: value.trim() }
                    });
                    e.target.value = '';
                  }
                }
              }}
            />
            {Object.keys(stats.metrics).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {Object.entries(stats.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">✅ {key}: {value}</span>
                    <button
                      onClick={() => {
                        const newMetrics = { ...stats.metrics };
                        delete newMetrics[key];
                        setStats({ ...stats, metrics: newMetrics });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handlePublishStatistic}
            disabled={isPublishing || !stats.title || !stats.description}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '⏳ Publicando...' : '🚀 Publicar Estadística'}
          </button>
        </div>
      )}

      {/* Reel Editor Modal */}
      {showReelEditor && selectedProduct && (
        <ReelEditor
          product={selectedProduct}
          onClose={() => setShowReelEditor(false)}
          onPublish={handleReelPublish}
        />
      )}
    </div>
  );
}

export default SocialMediaDashboard;
