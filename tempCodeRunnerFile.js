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
	pool.query(
		`INSERT INTO users(username, email, password) VALUES (${username}, ${email}, ${password});`,
	);
	const ans = {
		status: "success",
		message: req.data,
	};
	res.end(setResponse(res, ans, 200));