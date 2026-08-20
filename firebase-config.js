/* ============================================================
   FIREBASE SETTINGS — shared by photo likes + online games

   Fill these values once from Firebase Console → Project settings →
   General → Your apps → Web app → Firebase SDK configuration.

   For ONLINE LUDO also enable:
     1) Build → Authentication → Sign-in method → Google → Enable
     2) Build → Firestore Database → Create database
     3) Authentication → Settings → Authorized domains
        Add: rameshworkatuwal.github.io
     4) Paste the rules from firestore-online-rules.txt into
        Firestore → Rules → Publish

   Firebase web config values are intentionally visible in browser code.
   Access control comes from Firebase Authentication + Firestore rules.
   ============================================================ */

window.RK_FIREBASE = {
  PROJECT_ID: '',              // e.g. 'ritesh-games-a1b2c'
  API_KEY: '',                 // e.g. 'AIzaSy...'
  AUTH_DOMAIN: '',             // e.g. 'ritesh-games-a1b2c.firebaseapp.com'
  APP_ID: '',                  // e.g. '1:123456789:web:abcdef...'
  MESSAGING_SENDER_ID: '',     // optional but copy it if Firebase gives it
  STORAGE_BUCKET: ''           // optional for current games
};

/* ============================================================
   Existing PHOTO LIKE fallback

   Until PROJECT_ID + API_KEY are filled, photo likes still work only
   on the current device. Once configured, likes.js can use Firestore.

   Online multiplayer intentionally does NOT fake being online when
   Firebase is blank. The Online Ludo page will clearly show SETUP so
   visitors never think a local-only room is worldwide multiplayer.
   ============================================================ */
