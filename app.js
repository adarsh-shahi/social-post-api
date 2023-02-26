const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const pool = require("./config/db.js");
const authController = require("./controllers/auth.js");
const {
	setResponse,
	errorResoponse,
	parseData,
} = require("./controllers/utils.js");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

const handleAuthRequest = (req, res) => {
	if (req.method !== "POST") return;
	if (req.url === "/signup/" || req.url === "/signup") {
		authController.signup(req, res, pool);
		return true;
	}
	if (req.url === "/login/" || req.url === "/login") {
		authController.login(req, res, pool);
		return true;
	}
};

const handlePostRequest = (req, res) => {};

const handleGetRequest = (req, res) => {
	if (req.url === "" || req.url === "/")
		return res.end(setResponse(res, { message: "welcome there" }, 200));
};

/*
 *     Server Steup
 */

const requestListener = async (req, res) => {
	await parseData(req);
	if (handleAuthRequest(req, res)) return;

	/*
   If there is error in authorization, this condition will be true and
   we no longer need to process further
  */
	if (authController.protect(req, res)) return;
	if (req.method === "GET") return handleGetRequest(req, res);
	else if (req.method === "POST") return handlePostRequest(req, res);
	else if (req.method === "PUT") return handlePostRequest(req, res);
	else if (req.method === "DELETE") return handlePostRequest(req, res);
};

http.createServer(requestListener).listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`);
});
