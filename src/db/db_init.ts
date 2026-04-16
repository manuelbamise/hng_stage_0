import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./db.sqlite3', (err) => {
  if (err) {
    console.error({ status: 'error', message: err.message });
  }
  console.log('Connected to the SQLite database.');
});

db.run(
  `CREATE TABLE IF NOT EXISTS profiles(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL,
  gender_probability REAL NOT NULL,
  sample_size INTEGER NOT NULL,
  age INTEGER NOT NULL,
  age_group TEXT NOT NULL,
  country_id TEXT NOT NULL,
  country_probability REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT current_timestamp
  )`,
  (err) => {
    if (err) {
      console.error({ status: 'error', message: err.message });
    }
  },
);

export default db;
