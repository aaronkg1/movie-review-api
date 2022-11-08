import express from "express";
const router = express.Router();
import { secureRoute } from "./secureRoute.js";
import { registerUser, loginUser } from "../controllers/auth.js";
import { getProfile, getProfileById } from "../controllers/users.js";

// User

// register
router.route("/register")
	.post(registerUser);
// login
router.route("/login")
	.post(loginUser);
// profile
router.route("/profile")
	.get(secureRoute, getProfile);
router.route("/profile/:id")
	.get(secureRoute, getProfileById)
    export default router;