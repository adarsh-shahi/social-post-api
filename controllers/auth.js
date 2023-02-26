const bcrypt = require("bcryptjs");
const validator = require("validator");
const { setResponse, errorResoponse } = require("./utils.js");

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

const login = async (req, res, pool) => {
	try {
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
		// if we dont find user password - user dosent exist
		if (result.rows.length === 0)
			return errorResoponse(401, res, "account dosen't exist");

		const hashedPassFromDB = result.rows[0].password;

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

module.exports = { signup, login };
