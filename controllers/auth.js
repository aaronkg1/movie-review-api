import User from "../models/user.js";
import jwt from "jsonwebtoken";

// register user
export const registerUser = async (req, res) => {
	try {
		await User.create(req.body);
		return res.status(202).json({ message: "Registration Successful" });
	} catch (error) {
		return res.status(422).json(error.message);
	}
};

// login user

export const loginUser = async (req, res) => {
	try {
		// Destructure req.body
		const { email, password } = req.body;
		// Find a user by their email - returns null if not found
		const userToLogin = await User.findOne({ email: email });
		// If not found or passwords don't match then return unauthorised status
		if (!userToLogin || !userToLogin.validatePassword(password)) {
			return res.status(401).json({ message: "Unauthorised" });
		}
		// If we reach here, user is validated so we need to send a token
		// jwt.sign creates a token:
		// first argument is payload. This always needs a sub which identifies user making request (_id)
		// second is a secret string that we will need access to again if we want to decrypt the data
		const token = jwt.sign({ sub: userToLogin._id }, process.env.SECRET, {
			expiresIn: "7 days",
		});
		return res
			.status(200)
			.json({ message: `Welcome back, ${userToLogin.username}`, token: token });
	} catch (error) {
		console.log("error");
		return res.status(401).json(error);
	}
};
