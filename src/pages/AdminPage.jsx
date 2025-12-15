import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseservice';

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

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      let cancelled = false;

      const loadData = async () => {
        setLoading(true);
        try {
          console.log('🔄 Iniciando carga de datos admin...');

          // Load users
          console.log('👥 Cargando usuarios...');
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          if (cancelled) return;

          const usersData = [];
          usersSnapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() });
          });
          setUsers(usersData);
          console.log(`✅ ${usersData.length} usuarios cargados`);

          // Load orders (sin orderBy para evitar necesidad de índice)
          console.log('📦 Cargando órdenes...');
          const ordersRef = collection(db, 'orders');
          const ordersSnapshot = await getDocs(ordersRef);
          if (cancelled) return;

          const ordersData = [];
          let totalRevenue = 0;
          let cvCount = 0;
          let storeCount = 0;

          ordersSnapshot.forEach((doc) => {
            const order = { id: doc.id, ...doc.data() };
            ordersData.push(order);

            if (order.status === 'approved' && order.totalARS) {
              totalRevenue += order.totalARS;
            }

            if (order.type === 'cv_analysis') {
              cvCount++;
            } else {
              storeCount++;
            }
          });

          // Ordenar manualmente por fecha
          ordersData.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });

          setOrders(ordersData);
          console.log(`✅ ${ordersData.length} órdenes cargadas`);

          // Load products
          console.log('🛍️ Cargando productos...');
          const productsRef = collection(db, 'products');
          const productsSnapshot = await getDocs(productsRef);
          if (cancelled) return;

          const productsData = [];
          productsSnapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() });
          });
          setProducts(productsData);
          console.log(`✅ ${productsData.length} productos cargados`);

          // Update stats
          setStats({
            totalUsers: usersData.length,
            totalOrders: ordersData.length,
            totalRevenue,
            cvAnalysis: cvCount,
            storeOrders: storeCount
          });

          console.log('✅ Todos los datos cargados exitosamente');
        } catch (error) {
          if (!cancelled) {
            console.error('❌ Error cargando datos admin:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        cancelled = true;
      };
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
      setIsAuthenticated(true);
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
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

  const updateProductPrice = async (productId, newPrice) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        priceARS: parseFloat(newPrice),
        updatedAt: new Date()
      });
      alert('Precio actualizado exitosamente');

      // Recargar solo productos
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      alert('Error actualizando precio: ' + error.message);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {username}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Ver Sitio
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
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
              { id: 'products', label: 'Productos', icon: '🛍️' }
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
            </div>

            <div className="space-y-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdatePrice={updateProductPrice}
                  onDelete={deleteProduct}
                  formatARS={formatARS}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onUpdatePrice, onDelete, formatARS }) {
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(product.priceARS || 0);

  const handleSave = () => {
    onUpdatePrice(product.id, newPrice);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name || product.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.description}</p>

          <div className="flex items-center gap-4">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-32 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatARS(product.priceARS || 0)}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Editar Precio
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
