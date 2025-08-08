// src/utils/firebaseService.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, increment, serverTimestamp } from 'firebase/database';

// 🔥 CONFIGURACIÓN DE FIREBASE - MARIANO ALIANDRI (COMPLETA)
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Clase para manejar analytics de tu portfolio
export class FirebaseAnalyticsService {
  constructor() {
    this.database = database;
    console.log('🔥 Firebase inicializado para Portfolio Mariano Aliandri');
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

  // Registrar una visita al portfolio
  async recordVisit() {
    try {
      const visitId = this.getVisitorId();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log('📊 Registrando visita...', visitId);
      
      // Incrementar visitas totales
      await set(ref(this.database, 'portfolioStats/totalVisits'), increment(1));
      
      // Registrar visita diaria
      await set(ref(this.database, `portfolioStats/dailyVisits/${today}`), increment(1));
      
      // Verificar si es visitante único
      const visitorRef = ref(this.database, `portfolioVisitors/${visitId}`);
      const snapshot = await get(visitorRef);
      
      if (!snapshot.exists()) {
        // Nuevo visitante
        await set(visitorRef, {
          firstVisit: serverTimestamp(),
          visitCount: 1,
          lastVisit: serverTimestamp(),
          userAgent: navigator.userAgent.substring(0, 100) // Info del navegador
        });
        await set(ref(this.database, 'portfolioStats/uniqueVisitors'), increment(1));
        console.log('✨ Nuevo visitante registrado');
      } else {
        // Visitante que regresa
        await set(ref(this.database, `portfolioVisitors/${visitId}/visitCount`), increment(1));
        await set(ref(this.database, `portfolioVisitors/${visitId}/lastVisit`), serverTimestamp());
        console.log('🔄 Visitante recurrente');
      }

      console.log('✅ Visita registrada correctamente en Firebase');
    } catch (error) {
      console.error('❌ Error registrando visita:', error);
    }
  }

  // Manejar likes y dislikes del portfolio
  async handleVote(voteType) {
    try {
      const userId = this.getVisitorId();
      const userVoteRef = ref(this.database, `portfolioVotes/${userId}`);
      const snapshot = await get(userVoteRef);
      
      let previousVote = snapshot.exists() ? snapshot.val().type : null;
      
      console.log(`🗳️ Procesando voto: ${voteType}, anterior: ${previousVote}`);
      
      if (previousVote === voteType) {
        // Quitar voto
        await set(userVoteRef, null);
        await set(ref(this.database, `portfolioStats/${voteType}s`), increment(-1));
        console.log(`❌ Voto ${voteType} removido`);
        return null;
      } else if (previousVote && previousVote !== voteType) {
        // Cambiar voto
        await set(ref(this.database, `portfolioStats/${previousVote}s`), increment(-1));
        await set(ref(this.database, `portfolioStats/${voteType}s`), increment(1));
        await set(userVoteRef, { 
          type: voteType, 
          timestamp: serverTimestamp(),
          previousVote: previousVote 
        });
        console.log(`🔄 Voto cambiado de ${previousVote} a ${voteType}`);
        return voteType;
      } else {
        // Nuevo voto
        await set(ref(this.database, `portfolioStats/${voteType}s`), increment(1));
        await set(userVoteRef, { 
          type: voteType, 
          timestamp: serverTimestamp() 
        });
        console.log(`✨ Nuevo voto: ${voteType}`);
        return voteType;
      }
    } catch (error) {
      console.error('❌ Error en votación:', error);
      throw error;
    }
  }

  // Obtener estadísticas del portfolio
  async getStats() {
    try {
      const statsRef = ref(this.database, 'portfolioStats');
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('📊 Estadísticas cargadas:', data);
        return {
          totalVisits: data.totalVisits || 0,
          uniqueVisitors: data.uniqueVisitors || 0,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0
        };
      } else {
        console.log('📊 No hay estadísticas aún, inicializando...');
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
      const userVoteRef = ref(this.database, `portfolioVotes/${userId}`);
      const snapshot = await get(userVoteRef);
      
      const vote = snapshot.exists() ? snapshot.val().type : null;
      console.log('🗳️ Voto del usuario:', vote);
      return vote;
    } catch (error) {
      console.error('❌ Error obteniendo voto:', error);
      return null;
    }
  }

  // Registrar evento de calculadora ROI
  async trackROICalculation(company, result) {
    try {
      const eventRef = ref(this.database, `portfolioEvents/roiCalculations/${Date.now()}`);
      await set(eventRef, {
        company: company,
        roi: result.roi,
        savings: result.annualSavings,
        timestamp: serverTimestamp(),
        visitorId: this.getVisitorId()
      });
      console.log('📊 Calculación ROI registrada');
    } catch (error) {
      console.error('❌ Error registrando evento ROI:', error);
    }
  }

  // Registrar evento de calculadora Web
  async trackWebCalculation(company, result) {
    try {
      const eventRef = ref(this.database, `portfolioEvents/webCalculations/${Date.now()}`);
      await set(eventRef, {
        company: company,
        cost: result.developmentCost,
        roi: result.roi,
        timestamp: serverTimestamp(),
        visitorId: this.getVisitorId()
      });
      console.log('🌐 Calculación Web registrada');
    } catch (error) {
      console.error('❌ Error registrando evento Web:', error);
    }
  }
}
// Crear instancia global
export const firebaseAnalytics = new FirebaseAnalyticsService();