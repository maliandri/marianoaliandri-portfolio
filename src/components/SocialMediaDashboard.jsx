import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import makeService from '../utils/makeService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseservice';

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

  // Products state
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    title: '',
    description: '',
    metrics: {}
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
      const result = await makeService.publishCustom(postText, selectedNetworks);

      if (result.success) {
        showMessage('success', '¡Publicación enviada correctamente!');
        setPostText('');
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
        showMessage('success', '¡Producto publicado correctamente!');
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

  const handlePublishStatistic = async () => {
    if (!stats.title || !stats.description) {
      showMessage('error', 'Completa título y descripción');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await makeService.publishStatistic(stats);

      if (result.success) {
        showMessage('success', '¡Estadística publicada correctamente!');
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

          {/* Composer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto del Post
            </label>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={10}
              placeholder="Escribe tu publicación aquí..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {postText.length} caracteres
            </div>
          </div>

          <button
            onClick={handlePublishCustom}
            disabled={isPublishing || !postText.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '⏳ Publicando...' : '🚀 Publicar Ahora'}
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
                  {product.name} - ${product.price}
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

💰 Precio: $${selectedProduct.price}

¿Te interesa? Contactame:
https://marianoaliandri.com.ar/#contact

#Servicios #DesarrolloWeb #PowerBI #Python`}
              </div>
            </div>
          )}

          <button
            onClick={handlePublishProduct}
            disabled={isPublishing || !selectedProduct}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '⏳ Publicando...' : '🚀 Publicar Producto'}
          </button>
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
    </div>
  );
}

export default SocialMediaDashboard;
