import 'dotenv/config';
import { initializeFirebase, getFirebaseDB } from '../config/database';

const MOCK_TITLES = new Set([
  'Chess Club',
  'Spring Talent Show',
  'Debate Team',
  'Science Fair',
  'Art Club',
]);

async function removeMockEvents() {
  await initializeFirebase();
  const db = getFirebaseDB();
  const snapshot = await db.ref('events').once('value');
  const data = snapshot.val();

  if (!data) {
    console.log('No events found in database.');
    return;
  }

  const toDelete = Object.entries(data)
    .filter(([, value]) => MOCK_TITLES.has((value as any).title))
    .map(([id]) => id);

  if (toDelete.length === 0) {
    console.log('No mock events found — nothing to delete.');
    return;
  }

  const updates: Record<string, null> = {};
  for (const id of toDelete) {
    updates[id] = null;
  }

  await db.ref('events').update(updates);
  console.log(`Deleted ${toDelete.length} mock event(s):`, toDelete);
}

removeMockEvents().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
