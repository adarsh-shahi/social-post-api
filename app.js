const http = require("http");
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

const errorResoponse = (statusCode, res) => {
	const obj = {
		status: "fail",
		message: errorMessage(statusCode),
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
	console.log(req.data);
	try {
		if (!req.data) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		const { username, email, password } = req.data;
		if (!username || !email || !password)
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		console.log(`perfect`);
		await pool.query(
			`INSERT INTO users(username, email, password) VALUES ('${username}', '${email}', '${password}')`
		);
		const ans = {
			status: "success",
			message: req.data,
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
	console.log(req.url);
	if (req.url === "/signup") return signup(req, res);
	return errorResoponse(404, res);
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
