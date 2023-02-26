const { Pool } = require("pg");
const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	// idleTimeoutMillis: 3000, // If client is idle(not doing any work) then only after these seconds connection will be ended (default is 10sec)
});

module.exports = pool;
