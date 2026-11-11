/* Configuración de Firebase. Pega aquí los datos de tu proyecto (Consola de Firebase → Configuración del proyecto → Tus apps → Configuración del SDK).
   Estas claves NO son secretas: la seguridad la dan las reglas de Firestore (ver firestore.rules y FIREBASE.md).
   Mientras apiKey diga "PEGA...", la app funciona solo con localStorage (modo "Local"). */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDr8YW4EE654dXkHLdpDWI3wsHBT3E80BA",
  authDomain: "plantguard-c9c60.firebaseapp.com",
  projectId: "plantguard-c9c60",
  storageBucket: "plantguard-c9c60.firebasestorage.app",
  messagingSenderId: "100004766304",
  appId: "1:100004766304:web:a739e43a2c1233d6c61905",
  measurementId: "G-415P6YRLMQ"
};
/* Cada cuántos milisegundos se guarda una lectura de CADA planta en la nube (cuida la cuota gratuita de escrituras). */
window.PG_CLOUD = { readingEveryMs: 60000 };
