const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const pool = require("./config/db.js");
const authController = require("./controllers/auth.js");
const { errorResoponse, parseData } = require("./controllers/utils.js");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

const handlePostRequest = (req, res) => {
	if (!req.data) {
		return errorResoponse(
			404,
			res,
			"please provide username, email and password"
		);
	}
	if (req.url === "/signup" || req.url === "/signup/")
		return authController.signup(req, res, pool);
	if (req.url === "/login" || req.url === "/login/")
		return authController.login(req, res, pool);
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
