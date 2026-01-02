import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bufferService from '../utils/bufferService';
import imageGenerator from '../utils/imageGenerator';
import { format } from 'date-fns';

/**
 * Buffer Dashboard Component
 * Panel completo de gestión de redes sociales
 */
function BufferDashboard() {
  const [activeTab, setActiveTab] = useState('compose'); // compose, scheduled, analytics, settings
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Composer state
  const [postText, setPostText] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [publishType, setPublishType] = useState('now'); // now, schedule, queue
  const [isPublishing, setIsPublishing] = useState(false);

  // Scheduled posts state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [sentPosts, setSentPosts] = useState([]);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await bufferService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadProfiles();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const profilesData = await bufferService.getProfiles();
      setProfiles(profilesData);
      setSelectedProfiles(profilesData.map(p => p.id));
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadScheduledPosts = async () => {
    if (!profiles.length) return;

    try {
      const allScheduled = [];
      const allSent = [];

      for (const profile of profiles) {
        const pending = await bufferService.getPendingUpdates(profile.id);
        const sent = await bufferService.getSentUpdates(profile.id);

        allScheduled.push(...pending);
        allSent.push(...sent.slice(0, 10));
      }

      setScheduledPosts(allScheduled);
      setSentPosts(allSent);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!profiles.length) return;

    try {
      const profileAnalytics = await Promise.all(
        profiles.slice(0, 3).map(p => bufferService.getProfileAnalytics(p.id))
      );

      const totalAnalytics = profileAnalytics.reduce((acc, curr) => ({
        totalPosts: acc.totalPosts + curr.totalPosts,
        totalClicks: acc.totalClicks + curr.totalClicks,
        totalReaches: acc.totalReaches + curr.totalReaches,
        totalEngagements: acc.totalEngagements + curr.totalEngagements,
      }), {
        totalPosts: 0,
        totalClicks: 0,
        totalReaches: 0,
        totalEngagements: 0,
      });

      setAnalytics(totalAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handlePublish = async () => {
    if (!postText.trim()) {
      alert('Por favor escribe algo para publicar');
      return;
    }

    if (!selectedProfiles.length) {
      alert('Selecciona al menos una red social');
      return;
    }

    setIsPublishing(true);

    try {
      let result;

      if (publishType === 'now') {
        result = await bufferService.publishNow(selectedProfiles, postText);
      } else if (publishType === 'schedule') {
        const scheduledTimestamp = bufferService.formatDate(
          new Date(`${scheduleDate}T${scheduleTime}`)
        );
        result = await bufferService.schedulePost(
          selectedProfiles,
          postText,
          scheduledTimestamp
        );
      } else {
        result = await bufferService.addToQueue(selectedProfiles, postText);
      }

      // Limpiar formulario
      setPostText('');
      setScheduleDate('');
      setScheduleTime('');

      alert('Publicación creada exitosamente');

      // Recargar posts programados
      if (publishType !== 'now') {
        await loadScheduledPosts();
      }
    } catch (error) {
      alert('Error al publicar: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = async (updateId) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await bufferService.deleteUpdate(updateId);
      await loadScheduledPosts();
      alert('Publicación eliminada');
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleQuickTemplate = (template) => {
    const templates = {
      project: `🚀 Nuevo proyecto terminado

[Descripción del proyecto]

#DesarrolloWeb #PowerBI #Python #React

Ver más en mi portfolio 👇
https://marianoaliandri.com.ar`,

      tip: `💡 Tip: [Tu consejo aquí]

¿Necesitás ayuda con [tema]?
Hablemos 👇
https://marianoaliandri.com.ar/#contact

#Tech #Programming #WebDev`,

      service: `🎯 ¿Sabías que puedo ayudarte con [servicio]?

✅ [Beneficio 1]
✅ [Beneficio 2]
✅ [Beneficio 3]

Conocé más sobre mis servicios 👇
https://marianoaliandri.com.ar

#Freelance #WebDevelopment #PowerBI`
    };

    setPostText(templates[template] || '');
  };

  const tabs = [
    { id: 'compose', name: 'Crear', icon: '✍️' },
    { id: 'scheduled', name: 'Programadas', icon: '📅' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Configuración', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Buffer no configurado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Para usar el dashboard de redes sociales, necesitás configurar tu API token de Buffer.
          </p>
          <a
            href="https://buffer.com/developers/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Obtener API Token
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Social Media Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona todas tus redes sociales desde un solo lugar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'scheduled') loadScheduledPosts();
              if (tab.id === 'analytics') loadAnalytics();
            }}
            className={`
              px-6 py-3 font-medium transition-all duration-300 border-b-2
              ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Composer */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Crear publicación
              </h2>

              {/* Templates rápidos */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Templates rápidos:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickTemplate('project')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    🚀 Proyecto
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('tip')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    💡 Tip
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('service')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    🎯 Servicio
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="¿Qué querés compartir?"
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                {postText.length} / 2000
              </div>

              {/* Tipo de publicación */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Cuándo publicar?
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="now"
                      checked={publishType === 'now'}
                      onChange={(e) => setPublishType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Ahora</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="schedule"
                      checked={publishType === 'schedule'}
                      onChange={(e) => setPublishType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Programar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="queue"
                      checked={publishType === 'queue'}
                      onChange={(e) => setPublishType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Agregar a cola</span>
                  </label>
                </div>
              </div>

              {/* Schedule picker */}
              {publishType === 'schedule' && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Publish button */}
              <motion.button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isPublishing ? 1 : 1.02 }}
                whileTap={{ scale: isPublishing ? 1 : 0.98 }}
              >
                {isPublishing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Publicando...
                  </span>
                ) : publishType === 'now' ? 'Publicar ahora' : publishType === 'schedule' ? 'Programar' : 'Agregar a cola'}
              </motion.button>
            </div>

            {/* Sidebar - Profiles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Redes conectadas
              </h3>
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <label
                    key={profile.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProfiles([...selectedProfiles, profile.id]);
                        } else {
                          setSelectedProfiles(selectedProfiles.filter(id => id !== profile.id));
                        }
                      }}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.service}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{profile.formatted_username || profile.username}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'scheduled' && (
          <motion.div
            key="scheduled"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Publicaciones programadas ({scheduledPosts.length})
              </h2>

              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay publicaciones programadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white mb-2">
                          {post.text}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📅 {format(new Date(post.scheduled_at * 1000), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="ml-4 text-red-600 hover:text-red-700 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {analytics ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalPosts}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Clicks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalClicks}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Alcance</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalReaches}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Engagement</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalEngagements}
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-span-4 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Cargando analytics...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Configuración
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buffer Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="Ingresa tu token de Buffer"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configura esto en las variables de entorno (VITE_BUFFER_ACCESS_TOKEN)
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Redes conectadas
                  </h3>
                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {profile.service}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{profile.formatted_username || profile.username}
                          </p>
                        </div>
                        <span className="text-green-600">✓ Conectado</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BufferDashboard;
