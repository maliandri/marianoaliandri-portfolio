import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseservice';
import priceService from '../utils/priceService';
import SocialMediaDashboard from '../components/SocialMediaDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    cvAnalysis: 0,
    storeOrders: 0
  });

  const navigate = useNavigate();

  // Check if already authenticated (session)
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('adminAuth');
    if (isAdmin === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated (DEV: client SDK, PROD: Netlify Function)
  useEffect(() => {
    if (isAuthenticated) {
      let cancelled = false;

      const loadData = async () => {
        setLoading(true);

        try {
          const isDev = window.location.hostname === 'localhost';

          if (isDev) {
            // DESARROLLO: Firebase Client SDK
            console.log('🔄 [DEV] Cargando desde Firebase Client SDK...');

            const usersData = [];
            const ordersData = [];
            const productsData = [];
            let totalRevenue = 0;
            let cvCount = 0;
            let storeCount = 0;

            try {
              const usersSnap = await getDocs(collection(db, 'users'));
              usersSnap.forEach(d => usersData.push({ id: d.id, ...d.data() }));
            } catch (e) { console.error('Error usuarios:', e); }

            try {
              const ordersSnap = await getDocs(collection(db, 'orders'));
              ordersSnap.forEach(d => {
                const data = d.data();
                ordersData.push({ id: d.id, ...data });
                if (data.status === 'approved' || data.status === 'completed') totalRevenue += data.totalARS || 0;
                data.type === 'cv_analysis' ? cvCount++ : storeCount++;
              });
              ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            } catch (e) { console.error('Error órdenes:', e); }

            try {
              const productsSnap = await getDocs(collection(db, 'products'));
              productsSnap.forEach(d => productsData.push({ id: d.id, ...d.data() }));
            } catch (e) { console.error('Error productos:', e); }

            if (!cancelled) {
              setUsers(usersData);
              setOrders(ordersData);
              setProducts(productsData);
              setStats({ totalUsers: usersData.length, totalOrders: ordersData.length, totalRevenue, cvAnalysis: cvCount, storeOrders: storeCount });
              console.log('✅ [DEV] Cargado:', { users: usersData.length, orders: ordersData.length, products: productsData.length });
            }
          } else {
            // PRODUCCIÓN: Netlify Function
            console.log('🔄 [PROD] Cargando desde Netlify Function...');

            const response = await fetch('/.netlify/functions/admin-get-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: sessionStorage.getItem('adminUsername'),
                password: sessionStorage.getItem('adminPassword')
              })
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            const result = await response.json();
            if (cancelled) return;

            if (result.success) {
              setUsers(result.data.users);
              setOrders(result.data.orders);
              setProducts(result.data.products);
              setStats(result.data.stats);
              console.log('✅ [PROD] Cargado');
            } else {
              throw new Error(result.error);
            }
          }
        } catch (error) {
          if (!cancelled) {
            console.error('❌ Error cargando datos:', error);
            setLoginError('Error cargando datos.');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      loadData();
      return () => { cancelled = true; };
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Credenciales hardcodeadas (se pueden cambiar por variables de entorno)
    const ADMIN_USER = 'maliandri';
    const ADMIN_PASS = 'Maliandri$#652542026';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('adminAuth', 'true');
      sessionStorage.setItem('adminUsername', username);
      sessionStorage.setItem('adminPassword', password);
      setIsAuthenticated(true);
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const resetProducts = async () => {
    if (!confirm('⚠️ ¿Resetear TODOS los productos?\n\n' +
                 'Esto va a:\n' +
                 '- Eliminar todos los productos existentes\n' +
                 '- Crear 10 productos nuevos con precios USD\n\n' +
                 '¿Continuar?')) return;

    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/reset-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem('adminPassword')
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Productos reseteados!\n\n' +
              '🛍️ Productos creados: ' + result.productsCreated + '\n\n' +
              'Recargando...');
        window.location.reload();
      } else {
        throw new Error('Error reseteando productos');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAllDescriptions = async () => {
    if (!confirm('📝 ¿Actualizar descripciones de TODOS los productos?\n\n' +
                 'Esto va a actualizar las 10 descripciones con:\n' +
                 '- Beneficios detallados\n' +
                 '- Características específicas\n' +
                 '- Información técnica\n\n' +
                 '¿Continuar?')) return;

    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/update-all-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem('adminPassword')
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Descripciones actualizadas!\n\n' +
              '📝 Productos actualizados: ' + result.products.length + '\n\n' +
              'Recargando...');

        // Limpiar caché para que la tienda vea los cambios
        priceService.clearCache();
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error actualizando descripciones');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestOrders = async () => {
    if (!confirm('¿Crear datos de prueba?\n\n' +
                 '- 2 órdenes (CV + Tienda)\n' +
                 '- 10 productos\n\n' +
                 'Esto te ayudará a probar el sistema.')) return;

    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/create-test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem('adminPassword')
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Datos de prueba creados exitosamente!\n\n' +
              '📦 Órdenes: ' + Object.keys(result.data.orders).length + '\n' +
              '🛍️ Productos: ' + result.data.products.length + '\n\n' +
              'Recargando página...');

        // Recargar datos
        window.location.reload();
      } else {
        throw new Error('Error creando datos de prueba');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCVEmail = async (order) => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/send-cv-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.customerEmail,
          cvAnalysis: JSON.parse(order.cvAnalysis || '[]'),
          paymentId: order.paymentId,
          amount: order.totalARS,
          timestamp: order.createdAt
        })
      });

      if (response.ok) {
        alert('Email reenviado exitosamente a ' + order.customerEmail);
      } else {
        throw new Error('Error en el envío');
      }
    } catch (error) {
      alert('Error reenviando email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const isDev = window.location.hostname === 'localhost';

      if (isDev) {
        // DESARROLLO: usar Client SDK directamente
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          ...updates,
          updatedAt: new Date()
        });
      } else {
        // PRODUCCIÓN: usar Netlify Function con Admin SDK
        const response = await fetch('/.netlify/functions/update-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminPassword: sessionStorage.getItem('adminPassword'),
            productId,
            updates
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error actualizando producto');
        }
      }

      // Limpiar caché del priceService para que la tienda vea el cambio
      priceService.clearCache();

      alert('✅ Producto actualizado exitosamente');

      // Actualizar el estado local sin recargar desde Firestore
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, ...updates } : p
        )
      );
    } catch (error) {
      alert('❌ Error actualizando producto: ' + error.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      alert('Producto eliminado');

      // Recargar solo productos
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      alert('Error eliminando producto: ' + error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatARS = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Panel de Administración</h1>
          <p className="text-gray-400 text-center mb-8">Acceso restringido</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Iniciar Sesión
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Volver al sitio
          </button>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Título y botones en línea separada */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {username}</p>
            </div>

            {/* Botones en su propia fila */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={createTestOrders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                disabled={loading}
              >
                <span>🧪</span>
                Crear Datos de Prueba
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                🛍️ Ver Tienda
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'users', label: 'Usuarios', icon: '👥' },
              { id: 'orders', label: 'Órdenes', icon: '📦' },
              { id: 'products', label: 'Productos', icon: '🛍️' },
              { id: 'social', label: 'Redes Sociales', icon: '📱' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Órdenes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Análisis CV</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.cvAnalysis}</p>
                  </div>
                  <div className="text-4xl">📄</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tienda</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.storeOrders}</p>
                  </div>
                  <div className="text-4xl">🛍️</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Total</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatARS(stats.totalRevenue)}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Órdenes Recientes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.slice(0, 10).map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{order.id.slice(-8)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.type === 'cv_analysis'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {order.type === 'cv_analysis' ? 'CV Analysis' : 'Tienda'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.customerEmail || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">{formatARS(order.totalARS || 0)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Usuarios Registrados ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{user.displayName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Todas las Órdenes ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-sm text-gray-500 dark:text-gray-400">#{order.id.slice(-12)}</span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                        order.type === 'cv_analysis'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {order.type === 'cv_analysis' ? 'CV Analysis' : 'Tienda'}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatARS(order.totalARS || 0)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{order.customerEmail || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {order.type === 'cv_analysis' && (
                    <button
                      onClick={() => resendCVEmail(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📧 Reenviar Email
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Productos de la Tienda ({products.length})</h2>
              <div className="flex gap-3">
                <button
                  onClick={updateAllDescriptions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  📝 Actualizar Descripciones
                </button>
                <button
                  onClick={resetProducts}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  🔄 Resetear Productos (10)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdate={updateProduct}
                  onDelete={deleteProduct}
                  formatARS={formatARS}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'social' && (
          <SocialMediaDashboard />
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onUpdate, onDelete, formatARS }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name || product.title || '',
    description: product.description || '',
    priceUSD: product.priceUSD || 0,
    priceARS: product.priceARS || 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates = {
      name: formData.name,
      description: formData.description,
      priceUSD: parseFloat(formData.priceUSD) || 0
    };

    // Solo actualizar priceARS si existe
    if (formData.priceARS) {
      updates.priceARS = parseFloat(formData.priceARS);
    }

    onUpdate(product.id, updates);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: product.name || product.title || '',
      description: product.description || '',
      priceUSD: product.priceUSD || 0,
      priceARS: product.priceARS || 0
    });
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {editing ? (
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título del Producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Desarrollo Web Premium"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Precio USD (principal) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              💵 Precio (USD) - Principal
            </label>
            <input
              type="number"
              value={formData.priceUSD}
              onChange={(e) => handleChange('priceUSD', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este precio se usa en Calculadora ROI, Calculadora Web y Tienda
            </p>
          </div>

          {/* Precio ARS (opcional - se calcula automáticamente) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              💰 Precio (ARS) - Opcional
            </label>
            <input
              type="number"
              value={formData.priceARS}
              onChange={(e) => handleChange('priceARS', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Se calcula automáticamente"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dejalo vacío para usar conversión automática USD→ARS
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              💾 Guardar Cambios
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name || product.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              {product.priceUSD && (
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  USD {product.priceUSD}
                </span>
              )}
              {product.priceARS && (
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatARS(product.priceARS)}
                </span>
              )}
              {!product.priceUSD && !product.priceARS && (
                <span className="text-sm text-gray-500">Sin precio configurado</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
