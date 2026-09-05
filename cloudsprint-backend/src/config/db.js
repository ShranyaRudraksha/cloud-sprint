const { Pool, types } = require("pg");
require("dotenv").config();

// Our "timestamp without time zone" columns always store UTC wall-clock
// digits (the DB session runs in UTC). pg's default parser for that type
// (OID 1114) builds the JS Date using the Node process's *local* timezone
// instead of UTC, silently shifting every timestamp by the server's UTC
// offset. Force UTC interpretation so created_at/updated_at/etc. round-trip
// correctly regardless of what timezone the backend host is running in.
types.setTypeParser(1114, (str) => new Date(str.replace(" ", "T") + "Z"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;