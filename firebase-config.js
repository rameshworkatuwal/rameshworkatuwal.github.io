/* ============================================================
   PHOTO LIKES — Firebase settings

   Fill in the two values below once and likes start counting for
   real: every visitor's heart adds to the same total, and you can see
   the numbers yourself.

   Until they are filled in, the heart still works — it just remembers
   the like on that one device instead of counting everyone. Nothing
   breaks either way.

   ------------------------------------------------------------
   HOW TO GET THESE (about 10 minutes, one time, free)
   ------------------------------------------------------------
   1. Go to  https://console.firebase.google.com  and sign in.
   2. "Create a project" → give it any name → you can turn Google
      Analytics OFF → Create.
   3. In the left menu: Build → Firestore Database → Create database
      → choose "Start in production mode" → pick any location → Enable.
   4. Still in Firestore, open the "Rules" tab, delete what is there,
      paste the block at the bottom of this file, and press Publish.
   5. Click the gear icon (top left) → Project settings → General.
      Scroll to "Your apps" → click the  </>  (Web) icon → give it a
      nickname → Register app.
   6. It shows you a snippet. Copy just these two values into the
      lines below:
          projectId:  "..."   →  PROJECT_ID
          apiKey:     "..."   →  API_KEY

   The API key here is meant to be public — that is normal for
   Firebase. The rules you pasted in step 4 are what keep it safe:
   they only ever allow the like count to move by one.
   ============================================================ */

window.RK_FIREBASE = {
  PROJECT_ID: '',   // e.g. 'ritesh-portfolio-a1b2c'
  API_KEY: ''       // e.g. 'AIzaSy...'
};


/* ============================================================
   FIRESTORE RULES — paste this into step 4 above
   ============================================================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone may read the like counts, and may nudge one up or down
    // by exactly 1. Nothing else can be written, so the counter
    // cannot be set to an arbitrary number or spammed in bulk.
    match /likes/{photo} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['count'])
                    && request.resource.data.count == 1;
      allow update: if request.resource.data.keys().hasOnly(['count'])
                    && request.resource.data.count >= 0
                    && (request.resource.data.count == resource.data.count + 1
                     || request.resource.data.count == resource.data.count - 1);
      allow delete: if false;
    }

    match /{document=**} { allow read, write: if false; }
  }
}

============================================================ */
