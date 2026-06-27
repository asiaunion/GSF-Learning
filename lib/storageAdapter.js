import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq4bs-AysQ0tUTwz4qIcR_tXtVwd85B5Y",
  authDomain: "gsf-learning.firebaseapp.com",
  projectId: "gsf-learning",
  storageBucket: "gsf-learning.firebasestorage.app",
  messagingSenderId: "868223006130",
  appId: "1:868223006130:web:d8322c20f4828d237aa0ab",
  measurementId: "G-QZ7GB2VW59"
};

let app, auth, db, userDocRef;
let localData = {
  profile: { stars: 0, currentStreak: 0, lastActiveDate: null },
  mapProgress: { unlockedLessonId: 1, completedLessons: [] },
  srsStats: {},
  dailyLogs: {}
};
let isInitialized = false;

export const StorageAdapter = {
  async init() {
    if (isInitialized) return;
    
    // First load from localStorage to minimize loading screen time
    const ns = 'gsf_learning_';
    ['profile', 'mapProgress', 'srsStats', 'dailyLogs'].forEach(key => {
      const val = localStorage.getItem(ns + key);
      if (val) {
        try { localData[key] = JSON.parse(val); } catch(e){}
      }
    });

    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      userDocRef = doc(db, 'users', uid);
      
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) localData.profile = data.profile;
        if (data.mapProgress) localData.mapProgress = data.mapProgress;
        if (data.srsStats) localData.srsStats = data.srsStats;
        if (data.dailyLogs) localData.dailyLogs = data.dailyLogs;
      } else {
        // Initialize new user document in Firestore
        await setDoc(userDocRef, localData);
      }
      isInitialized = true;
    } catch (e) {
      console.error("Firebase init failed, working in offline mode:", e);
      isInitialized = true;
    }
  },

  getProfile() { return localData.profile; },
  saveProfile(data) {
    localData.profile = data;
    this._sync('profile', data);
  },

  getMapProgress() { return localData.mapProgress; },
  saveMapProgress(data) {
    localData.mapProgress = data;
    this._sync('mapProgress', data);
  },

  getSrsStats() { return localData.srsStats; },
  saveSrsStats(data) {
    localData.srsStats = data;
    this._sync('srsStats', data);
  },

  getDailyLogs() { return localData.dailyLogs; },
  saveDailyLog(dateStr, data) {
    localData.dailyLogs[dateStr] = data;
    this._sync('dailyLogs', localData.dailyLogs);
  },

  _sync(field, data) {
    // 1. Save to LocalStorage as backup/offline mode
    try {
      localStorage.setItem('gsf_learning_' + field, JSON.stringify(data));
    } catch (e) {}

    // 2. Sync to Firestore if initialized
    if (userDocRef) {
      updateDoc(userDocRef, { [field]: data }).catch(e => console.error("Firestore sync failed", e));
    }
  }
};
