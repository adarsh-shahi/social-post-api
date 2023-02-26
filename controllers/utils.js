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

module.exports = {
	setResponse,
	errorResoponse,
	parseData,
};
