import User from "../models/user.js"; // Bring in the User model to query
import jwt from "jsonwebtoken"; // import jwt so we can use the jwt.verify
// bring in secret to be used in jwt.verify

// This function is going to be middleware
// Because it's middleware (defined in our router methods) we will have access to req, res and next
export const secureRoute = async (req, res, next) => {
	try {
		// Check headers to see if Autorization token exists in the headers object
		// throw new Error() forces the catch error
		if (!req.headers.authorization) throw new Error("Missing Header");
		// If we get to this point, the authorization header is present so we can remove Bearer from header
		// We can then pass it into jwt.sign()
		const token = req.headers.authorization.replace("Bearer ", "");
		// If verified it returns the payload, we can then use this payload to query the user collection to see if that user still exists
		const payload = jwt.verify(token, process.env.SECRET);
		const userToVerify = await User.findById(payload.sub);
		// If no user is found with id on the payload.sub, we will throw an error as it is no longer a valid token
		if (!userToVerify) throw new Error("User not found");
		// At this point, we've verified the token and matched it against the user and are happy
		// to pass this on to the controller

		// req.currentUser doesn't currently exist, it's an undefined key
		// Whenever we use middleware, we can add information to the req object
		// and it will be available further down the line when we use next()
		req.currentUser = userToVerify;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Unauthorised" });
	}
};
