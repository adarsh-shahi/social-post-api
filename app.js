const http = require("http");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
const pool = require("./config/db.js");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

/*
 *     Utils
 */

const setResponse = (res, obj, statusCode) => {
	res.statusCode = statusCode || 200;
	res.setHeader("Content-Type", "application/json;charset=utf-8");
	return JSON.stringify(obj);
};

const errorMessage = (statusCode) => {
	if (statusCode === 400) return "Page not found";
	else if (statusCode === 500) return "server error";
};

const errorResoponse = (statusCode, res, message) => {
	const obj = {
		status: "fail",
		message: message || errorMessage(statusCode),
	};
	res.end(setResponse(res, obj, statusCode));
};

const parseData = (req) => {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});

		req.on("end", () => {
			req.data = JSON.parse(body);
			resolve(req.data);
		});
	});
};

/*
 *     Features
 */

const signup = async (req, res) => {
	try {
		if (!req.data) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		const { username, email, password } = req.data;
		if (!username || !email || !password) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		console.log(hashedPassword);
		await pool.query(
			`INSERT INTO users(username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`
		);
		const ans = {
			status: "success",
			message: {
				username,
				email,
			},
		};
		res.end(setResponse(res, ans, 200));
	} catch (err) {
		console.log(err);
		errorResoponse(500, res, err.detail);
	}
};

const login = async (req, res) => {
	try {
		if (!req.data) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		const { username, email, password } = req.data;
		if (!password || (!email && !username)) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		const key = email ? "email" : "username";
		const value = email ? email : username;

		// Reterving password from DB
		const result = await pool.query(
			`SELECT password FROM users WHERE ${key} = '${value}'`
		);
		const hashedPassFromDB = result.rows[0].password;

		console.log(hashedPassFromDB);
		if (!hashedPassFromDB)
			// if we dont find user password - user dosent exist
			return errorResoponse(401, res, "account dosen't exist");

		// Comparing passwords
		if (!(await bcrypt.compare(password, hashedPassFromDB)))
			return errorResoponse(401, res, "login failed");

		const ans = {
			status: "success",
			message: {
				key,
			},
		};
		res.end(setResponse(res, ans, 200));
	} catch (err) {
		errorResoponse(500, res);
	}
};

/*
 *     Handle Method Type
 */

const handlePostRequest = (req, res) => {
	if (req.url === "/signup" || req.url === "/signup/") return signup(req, res);
	if (req.url === "/login" || req.url === "/login/") return login(req, res);
	return errorResoponse(400, res);
};

/*
 *     Server Steup
 */

const requestListener = async (req, res) => {
	await parseData(req);
	if (req.method === "GET") return handleGetRequest(req, res);
	else if (req.method === "POST") return handlePostRequest(req, res);
	else if (req.method === "PUT") return handlePostRequest(req, res);
	else if (req.method === "DELETE") return handlePostRequest(req, res);
};

http.createServer(requestListener).listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`);
});

module.exports = requestListener;
