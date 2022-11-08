import express from "express";
import mongoose from "mongoose";
import movieRoutes from "./routes/movieRouter.js";
import showRoutes from "./routes/showRouter.js";
import authRoutes from "./routes/authRouter.js";
import genreRoutes from "./routes/genreRouter.js";
import searchRoutes from "./routes/searchRouter.js";
import cors from "cors";
import dotenv from "dotenv";

// Variables
const app = express();
dotenv.config();
const port = process.env.PORT;
const startServer = async () => {
	try {
		//Attempt mongodb connection
		await mongoose.connect(process.env.DB_URI).then(() => {
			console.log("Mongodb connected");
		});

		// If mongodb connect successfully start node server

		// Middleware

		// Json parser
		app.use(express.json({ limit: "30mb" }));
		app.use(express.urlencoded({ extended: false }));
		app.use(cors());

		// Logger
		app.use((req, _res, next) => {
			console.log(`Request received: ${req.method} : ${req.url}`);
			next();
		});

		// Routes

		app.use("/", authRoutes);
		app.use("/movies", movieRoutes);
		app.use("/tvshows", showRoutes);
		app.use("/genres", genreRoutes);
		app.use("/search", searchRoutes);

		// Catch All
		app.use((_req, res) => {
			res.status(404).json({ message: "Route Not Found" });
		});

		// Listen for requests

		app.listen(port, () => {
			console.log(`🚀 Server listening on port ${port}`);
		});
	} catch (error) {
		console.log(error);
	}
};
startServer();
