const bcrypt = require("bcryptjs");
const validator = require("validator");
const { setResponse, errorResoponse } = require("./utils.js");
const jwt = require("jsonwebtoken");

const signJWT = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: "30d",
	});
};

const signup = async (req, res, pool) => {
	try {
		const { username, email, password } = req.data;
		if (!username || !email || !password) {
			return errorResoponse(
				404,
				res,
				"please provide username, email and password"
			);
		}
		if (username.length < 3)
			return errorResoponse(
				404,
				res,
				"username should be greater than eqaul to 3"
			);
		if (password.length < 5)
			return errorResoponse(404, res, "password length must be atleast 5");
		if (!validator.isEmail(email))
			return errorResoponse(404, res, "provide valid email");
		const hashedPassword = await bcrypt.hash(password, 10);
		console.log(hashedPassword);
		await pool.query(
			`INSERT INTO users(username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`
		);
		const results = await pool.query(
			`SELECT id FROM users WHERE email = '${email}'`
		);
		console.log(results.rows[0].id);
		const ans = {
			status: "success",
			message: {
				user: {
					username,
					email,
				},
				token: signJWT({ id: results.rows[0].id }),
			},
		};
		res.end(setResponse(res, ans, 200));
	} catch (err) {
		console.log(err);
		errorResoponse(500, res, err.detail);
	}
};

const login = async (req, res, pool) => {
	try {
		console.log(req.data);
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
			`SELECT id, password, username, email FROM users WHERE ${key} = '${value}'`
		);
		// if we dont find user password - user dosent exist
		if (result.rows.length === 0)
			return errorResoponse(401, res, "account dosen't exist");

		console.log(result.rows[0]);
		const hashedPassFromDB = result.rows[0].password;
		const userEmail = result.rows[0].email;
		const userUsername = result.rows[0].username;
		const userId = result.rows[0].id;

		// Comparing passwords
		if (!(await bcrypt.compare(password, hashedPassFromDB)))
			return errorResoponse(401, res, "login failed");

		const ans = {
			status: "success",
			message: {
				user: {
					email: userEmail,
					username: userUsername,
				},
				token: signJWT({ id: userId }),
			},
		};
		res.end(setResponse(res, ans, 200));
	} catch (err) {
		errorResoponse(500, res);
	}
};

const protect = (req, res, pool) => {
	// 1) Getting token and check if its there

	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token) {
		errorResoponse(401, res, "you are not logged in");
		return true;
	}

	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
		if (err) {
			errorResoponse(500, res, `failed to authenticate token`);
			return true;
		}
		console.log(decoded);
		req.id = decoded.id;
	});
	console.log(req.id);
};

module.exports = { signup, login, protect };
