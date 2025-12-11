// src/utils/firebaseService.js
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// 🔥 CONFIGURACIÓN DE FIREBASE - MARIANO ALIANDRI (FIRESTORE)
const firebaseConfig = {
  apiKey: "AIzaSyDRyVEpQm6e_kFTw5PO3UhXZjLBw75SiLU",
  authDomain: "marianoaliandri-3b135.firebaseapp.com",
  databaseURL: "https://marianoaliandri-3b135-default-rtdb.firebaseio.com",
  projectId: "marianoaliandri-3b135",
  storageBucket: "marianoaliandri-3b135.firebasestorage.app",
  messagingSenderId: "19495778585",
  appId: "1:19495778585:web:f30bba1b1db0b7992bed88",
  measurementId: "G-58KFTQRM7Z"
};

// Inicializar Firebase con Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Clase para manejar analytics de tu portfolio con Firestore
export class FirebaseAnalyticsService {
  constructor() {
    this.db = db;
    console.log('🔥 Firebase Firestore inicializado para Portfolio Mariano Aliandri');
  }

  // Generar ID único para cada visitante
  getVisitorId() {
    let visitorId = localStorage.getItem('marianoPortfolioVisitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('marianoPortfolioVisitorId', visitorId);
    }
    return visitorId;
  }

  // Asegura que exista el documento de estadísticas
  async ensureStatsDoc() {
    const statsRef = doc(this.db, 'analytics', 'stats');
    const snap = await getDoc(statsRef);
    if (!snap.exists()) {
      await setDoc(
        statsRef,
        { totalVisits: 0, uniqueVisitors: 0, likes: 0, dislikes: 0 },
        { merge: true }
      );
    }
  }

  // Registrar una visita al portfolio
  async recordVisit() {
    try {
      const visitId = this.getVisitorId();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      await this.ensureStatsDoc();

      console.log('📊 Registrando visita...', visitId);

      // Referencia al documento de estadísticas
      const statsRef = doc(this.db, 'analytics', 'stats');

      // Obtener estadísticas actuales
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        // Incrementar visitas totales
        await updateDoc(statsRef, {
          totalVisits: increment(1)
        });
      } else {
        // Crear documento inicial (backup si otro cliente aún no lo creó)
        await setDoc(statsRef, {
          totalVisits: 1,
          uniqueVisitors: 0,
          likes: 0,
          dislikes: 0
        });
      }

      // Verificar si es visitante único
      const visitorRef = doc(this.db, 'visitors', visitId);
      const visitorDoc = await getDoc(visitorRef);

      if (!visitorDoc.exists()) {
        // Nuevo visitante
        await setDoc(visitorRef, {
          firstVisit: serverTimestamp(),
          visitCount: 1,
          lastVisit: serverTimestamp(),
          userAgent: navigator.userAgent.substring(0, 100),
          date: today
        });

        // Incrementar visitantes únicos
        await updateDoc(statsRef, {
          uniqueVisitors: increment(1)
        });
        console.log('✨ Nuevo visitante registrado');
      } else {
        // Visitante que regresa
        await updateDoc(visitorRef, {
          visitCount: increment(1),
          lastVisit: serverTimestamp()
        });
        console.log('🔄 Visitante recurrente');
      }

      console.log('✅ Visita registrada correctamente en Firestore');
    } catch (error) {
      console.error('❌ Error registrando visita:', error);
      throw error;
    }
  }

  // Manejar likes y dislikes del portfolio (ATÓMICO con transacciones)
  async handleVote(voteType) {
    try {
      const userId = this.getVisitorId();
      const userVoteRef = doc(this.db, 'userVotes', userId);
      const statsRef = doc(this.db, 'analytics', 'stats');

      // Asegurar doc de estadísticas
      await this.ensureStatsDoc();

      let resultType = null;

      await runTransaction(this.db, async (tx) => {
        const [voteSnap, statsSnap] = await Promise.all([
          tx.get(userVoteRef),
          tx.get(statsRef)
        ]);

        if (!statsSnap.exists()) {
          tx.set(statsRef, { totalVisits: 0, uniqueVisitors: 0, likes: 0, dislikes: 0 });
        }

        const prev = voteSnap.exists() ? (voteSnap.data().type || null) : null;

        // Quitar el mismo voto
        if (prev === voteType) {
          resultType = null;
          tx.set(
            userVoteRef,
            { type: null, timestamp: serverTimestamp() },
            { merge: true }
          );
          if (voteType === 'like') tx.update(statsRef, { likes: increment(-1) });
          else tx.update(statsRef, { dislikes: increment(-1) });
          return;
        }

        // Cambiar voto (like -> dislike o viceversa)
        if (prev && prev !== voteType) {
          if (prev === 'like') {
            tx.update(statsRef, { likes: increment(-1), dislikes: increment(1) });
          } else {
            tx.update(statsRef, { dislikes: increment(-1), likes: increment(1) });
          }
          tx.set(
            userVoteRef,
            { type: voteType, timestamp: serverTimestamp(), previousVote: prev },
            { merge: true }
          );
          resultType = voteType;
          return;
        }

        // Voto nuevo
        if (!prev) {
          if (voteType === 'like') tx.update(statsRef, { likes: increment(1) });
          else tx.update(statsRef, { dislikes: increment(1) });
          tx.set(
            userVoteRef,
            { type: voteType, timestamp: serverTimestamp() },
            { merge: true }
          );
          resultType = voteType;
        }
      });

      console.log(`✅ Voto aplicado:`, resultType);
      return resultType;
    } catch (error) {
      console.error('❌ Error en votación (tx):', error);
      throw error;
    }
  }

  // Obtener estadísticas del portfolio
  async getStats() {
    try {
      const statsRef = doc(this.db, 'analytics', 'stats');
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        const data = statsDoc.data();
        console.log('📊 Estadísticas cargadas:', data);
        return {
          totalVisits: data.totalVisits || 0,
          uniqueVisitors: data.uniqueVisitors || 0,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0
        };
      } else {
        console.log('📊 No hay estadísticas aún, inicializando...');
        // Crear documento inicial
        await setDoc(statsRef, {
          totalVisits: 0,
          uniqueVisitors: 0,
          likes: 0,
          dislikes: 0
        });
        return {
          totalVisits: 0,
          uniqueVisitors: 0,
          likes: 0,
          dislikes: 0
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        likes: 0,
        dislikes: 0
      };
    }
  }

  // Obtener voto del usuario actual
  async getUserVote() {
    try {
      const userId = this.getVisitorId();
      const userVoteRef = doc(this.db, 'userVotes', userId);
      const userVoteDoc = await getDoc(userVoteRef);

      const vote = userVoteDoc.exists() ? userVoteDoc.data().type : null;
      console.log('🗳️ Voto del usuario:', vote);
      return vote;
    } catch (error) {
      console.error('❌ Error obteniendo voto:', error);
      return null;
    }
  }

  // Suscribirse a cambios en tiempo real de estadísticas
  subscribeToStats(callback) {
    try {
      const statsRef = doc(this.db, 'analytics', 'stats');

      const unsubscribe = onSnapshot(
        statsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const stats = {
              totalVisits: data.totalVisits || 0,
              uniqueVisitors: data.uniqueVisitors || 0,
              likes: data.likes || 0,
              dislikes: data.dislikes || 0
            };
            console.log('📊 Estadísticas actualizadas en tiempo real:', stats);
            callback(stats);
          }
        },
        (error) => {
          console.error('❌ Error en suscripción a estadísticas:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error creando suscripción:', error);
      return () => {}; // cleanup vacío
    }
  }

  // Registrar evento de calculadora ROI
  async trackROICalculation(company, result) {
    try {
      const eventRef = doc(this.db, 'events', `roi_${Date.now()}`);
      await setDoc(eventRef, {
        type: 'roi_calculation',
        company: company,
        roi: result.roi,
        savings: result.annualSavings,
        timestamp: serverTimestamp(),
        visitorId: this.getVisitorId()
      });
      console.log('📊 Calculación ROI registrada en Firestore');
    } catch (error) {
      console.error('❌ Error registrando evento ROI:', error);
    }
  }

  // Registrar evento de calculadora Web
  async trackWebCalculation(company, result) {
    try {
      const eventRef = doc(this.db, 'events', `web_${Date.now()}`);
      await setDoc(eventRef, {
        type: 'web_calculation',
        company: company,
        cost: result.developmentCost,
        roi: result.roi,
        timestamp: serverTimestamp(),
        visitorId: this.getVisitorId()
      });
      console.log('🌐 Calculación Web registrada en Firestore');
    } catch (error) {
      console.error('❌ Error registrando evento Web:', error);
    }
  }
}

// Crear instancia global
export const firebaseAnalytics = new FirebaseAnalyticsService();

// ========================================
// 🔐 SERVICIO DE AUTENTICACIÓN CON GOOGLE
// ========================================

export class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = googleProvider;
    this.db = db;
    console.log('🔐 Firebase Auth inicializado para Portfolio Mariano Aliandri');
  }

  // Verificar resultado de redirect al cargar la página
  async checkRedirectResult() {
    try {
      const result = await getRedirectResult(this.auth);
      if (result && result.user) {
        console.log('✅ Login con redirect exitoso:', result.user.displayName);

        // Intentar guardar datos del usuario en Firestore (no bloqueante)
        try {
          const userRef = doc(this.db, 'users', result.user.uid);
          await setDoc(userRef, {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp()
          }, { merge: true });
          console.log('✅ Datos de usuario guardados en Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ No se pudieron guardar datos en Firestore:', firestoreError.message);
        }

        return { success: true, user: result.user };
      }
      return { success: true, user: null };
    } catch (error) {
      console.error('❌ Error en redirect result:', error);
      return { success: false, error: error.message };
    }
  }

  // Login con Google (Popup)
  async loginWithGoogle() {
    try {
      console.log('🔑 Iniciando login con Google (popup)...');
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      // Intentar guardar datos del usuario en Firestore (no bloqueante)
      try {
        const userRef = doc(this.db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
        console.log('✅ Datos de usuario guardados en Firestore');
      } catch (firestoreError) {
        // No bloquear el login si Firestore falla
        console.warn('⚠️ No se pudieron guardar datos en Firestore:', firestoreError.message);
        console.warn('El login continuará de todas formas');
      }

      console.log('✅ Login exitoso:', user.displayName);
      return {
        success: true,
        user: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      console.error('❌ Error en login popup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login con Google (Redirect) - Más confiable en producción
  async loginWithGoogleRedirect() {
    try {
      console.log('🔑 Iniciando login con Google (redirect)...');
      await signInWithRedirect(this.auth, this.googleProvider);
      // El redirect ocurre aquí, el código siguiente no se ejecuta
      return { success: true };
    } catch (error) {
      console.error('❌ Error en login redirect:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(this.auth);
      console.log('👋 Logout exitoso');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Escuchar cambios en el estado de autenticación
  onAuthChange(callback) {
    return onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.displayName);
        callback({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        console.log('👤 Usuario no autenticado');
        callback(null);
      }
    });
  }

  // Obtener datos completos del usuario desde Firestore
  async getUserData(uid) {
    try {
      const userRef = doc(this.db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo datos del usuario:', error);
      return null;
    }
  }
}

// Crear instancia global de autenticación
export const firebaseAuth = new FirebaseAuthService();

// Exportar db para uso directo en páginas
export { db };
