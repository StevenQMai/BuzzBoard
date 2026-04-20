const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();

// 🔑 Load service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// load your JSON file
const data = JSON.parse(fs.readFileSync("buzzboardeventdata.json", "utf8"));

async function upload() {
  let batch = db.batch();
  let count = 0;

  for (const event of data) {
    // use Id as document ID (matches your current setup)
    const docRef = db.collection("events").doc(String(event.Id));

    // 🚨 NO CLEANING — store EXACTLY as-is
    batch.set(docRef, event, { merge: true });
    count++;

    // commit every 500 (Firestore limit)
    if (count === 500) {
      await batch.commit();
      console.log("Committed 500");
      batch = db.batch();
      count = 0;
    }
  }

  // commit remaining
  if (count > 0) {
    await batch.commit();
  }

  console.log("✅ DONE");
}

upload();