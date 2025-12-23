// src/components/RadarWeb.jsx
// 🌐 Radar de Tecnologías Web - Muestra qué tecnologías se aplican a cada tipo de web
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RadarWeb({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  hideFloatingButton = false
}) {
  // 🔄 Estado híbrido para el modal
  const [openInternal, setOpenInternal] = useState(false);
  const open = isOpenProp !== undefined ? isOpenProp : openInternal;

  // Función de setOpen adaptada
  const setOpen = (value) => {
    if (onCloseProp && !value) {
      onCloseProp();
    } else if (isOpenProp === undefined) {
      setOpenInternal(value);
    }
  };

  const [selectedProject, setSelectedProject] = useState(null);

  // 📊 Datos de proyectos con tecnologías
  const projects = [
    {
      id: 'almamod',
      name: 'Almamod',
      type: 'E-commerce',
      url: 'https://almamod.com',
      description: 'Tienda online de módulos habitacionales con chatbot IA',
      technologies: [
        { name: 'React', icon: '⚛️', category: 'Frontend', benefit: 'UI interactiva y dinámica' },
        { name: 'Vite', icon: '⚡', category: 'Build Tool', benefit: 'Desarrollo ultrarrápido' },
        { name: 'Tailwind CSS', icon: '🎨', category: 'Estilos', benefit: 'Diseño responsive moderno' },
        { name: 'Firebase', icon: '🔥', category: 'Backend', benefit: 'Base de datos en tiempo real' },
        { name: 'Gemini AI', icon: '🤖', category: 'IA', benefit: 'Chatbot para atención al cliente' },
        { name: 'Resend', icon: '📧', category: 'Email', benefit: 'Envío de leads por email' },
        { name: 'Mercado Pago', icon: '💳', category: 'Pagos', benefit: 'Integración de pagos' },
        { name: 'Cloudinary', icon: '☁️', category: 'Imágenes', benefit: 'Optimización de imágenes' },
        { name: 'React Router', icon: '🗺️', category: 'Navegación', benefit: 'Rutas dinámicas' },
      ],
      color: 'blue'
    },
    {
      id: 'aluminehogar',
      name: 'Alumine Hogar',
      type: 'E-commerce',
      url: 'https://aluminehogar.com.ar',
      description: 'E-commerce de productos para el hogar con optimización de conversión',
      technologies: [
        { name: 'React', icon: '⚛️', category: 'Frontend', benefit: 'Componentes reutilizables' },
        { name: 'Vercel', icon: '▲', category: 'Deploy', benefit: 'Deploy automático y CDN global' },
        { name: 'Tailwind CSS', icon: '🎨', category: 'Estilos', benefit: 'Diseño personalizado rápido' },
        { name: 'Framer Motion', icon: '🎬', category: 'Animaciones', benefit: 'Animaciones fluidas' },
        { name: 'Firebase', icon: '🔥', category: 'Backend', benefit: 'Analytics y autenticación' },
        { name: 'React Leaflet', icon: '🗺️', category: 'Mapas', benefit: 'Mapas interactivos' },
      ],
      color: 'green'
    },
    {
      id: 'portfolio',
      name: 'Portfolio Mariano Aliandri',
      type: 'Portfolio Personal',
      url: 'https://marianoaliandri.com',
      description: 'Portfolio profesional con herramientas interactivas',
      technologies: [
        { name: 'React', icon: '⚛️', category: 'Frontend', benefit: 'SPA de alto rendimiento' },
        { name: 'Vite', icon: '⚡', category: 'Build Tool', benefit: 'HMR instantáneo' },
        { name: 'Tailwind CSS', icon: '🎨', category: 'Estilos', benefit: 'Sistema de diseño consistente' },
        { name: 'Firebase Auth', icon: '🔐', category: 'Autenticación', benefit: 'Login con Google' },
        { name: 'Firestore', icon: '🔥', category: 'Base de Datos', benefit: 'Datos en tiempo real' },
        { name: 'Framer Motion', icon: '🎬', category: 'Animaciones', benefit: 'Experiencia premium' },
        { name: 'Recharts', icon: '��', category: 'Gráficos', benefit: 'Visualización de datos' },
        { name: 'Gemini AI', icon: '🤖', category: 'IA', benefit: 'Chatbot inteligente' },
        { name: 'Express', icon: '🚂', category: 'Backend', benefit: 'API REST para ATS' },
      ],
      color: 'purple'
    }
  ];

  // 🎯 Categorías de tecnologías
  const categories = [
    { name: 'Frontend', icon: '⚛️', color: 'bg-blue-500' },
    { name: 'Backend', icon: '🔥', color: 'bg-red-500' },
    { name: 'Estilos', icon: '🎨', color: 'bg-pink-500' },
    { name: 'Deploy', icon: '▲', color: 'bg-green-500' },
    { name: 'Pagos', icon: '💳', color: 'bg-yellow-500' },
    { name: 'Email', icon: '📧', color: 'bg-purple-500' },
    { name: 'IA', icon: '🤖', color: 'bg-indigo-500' },
    { name: 'Otros', icon: '🔧', color: 'bg-gray-500' },
  ];

  return (
    <>
      {/* 🎯 Botón flotante - SOLO SI NO ESTÁ CONTROLADO POR BADGE */}
      {!hideFloatingButton && (
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed bottom-72 left-6 z-40 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          aria-label="Radar Web"
          title="Radar de Tecnologías Web"
        >
          <span className="text-xl">🌐</span>
          <span className="font-semibold">Radar Web</span>
        </motion.button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:justify-end bg-black/60 p-4 md:pr-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 md:mr-4"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <span>🌐</span>
                  Radar de Tecnologías Web
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Explora qué tecnologías aplico en cada tipo de proyecto web
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>

            {/* Grid de Proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                  }`}
                  onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Badge tipo */}
                  <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                    project.color === 'blue' ? 'bg-blue-500 text-white' :
                    project.color === 'green' ? 'bg-green-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {project.type}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2 mb-2">
                    {project.name}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {project.description}
                  </p>

                  {/* Contador de tecnologías */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">{project.technologies.length}</span>
                    <span>tecnologías</span>
                  </div>

                  {/* Indicador de selección */}
                  {selectedProject?.id === project.id && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Detalle del proyecto seleccionado */}
            <AnimatePresence mode="wait">
              {selectedProject && (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Stack Tecnológico: {selectedProject.name}
                      </h3>
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Ver proyecto <span>🔗</span>
                      </a>
                    </div>

                    {/* Grid de tecnologías */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedProject.technologies.map((tech, index) => (
                        <motion.div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{tech.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                                  {tech.name}
                                </h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300">
                                  {tech.category}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {tech.benefit}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mensaje cuando no hay selección */}
            {!selectedProject && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-3 block">👆</span>
                <p className="text-sm">Selecciona un proyecto para ver su stack tecnológico completo</p>
              </div>
            )}

            {/* Footer con leyenda */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Cada proyecto usa el stack óptimo según sus necesidades específicas
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
