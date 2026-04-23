import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAxCfDP-uEwl7rLGIDQa8lYGr_n8HdIDyE',
  authDomain: 'clure-72a51.firebaseapp.com',
  projectId: 'clure-72a51',
  storageBucket: 'clure-72a51.firebasestorage.app',
  messagingSenderId: '466186658336',
  appId: '1:466186658336:web:e083c372ce7277e12f1245',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
