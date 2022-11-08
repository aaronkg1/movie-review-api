import express from "express";
const router = express.Router();
import { secureRoute } from "./secureRoute.js";

import {
	addMovieReview,
	deleteMovie,
	deleteMovieReview,
	getMovie,
	getMovieCount,
	getMoviesByGenre,
	getAllMovies,
	postNewMovie,
	updateMovie,
	updateMovieReview,
} from "../controllers/movies.js";

// Movies
router.route("/")
	.get(getAllMovies)
	.post(secureRoute, postNewMovie);

router.route("/page/:pageNumber")
	.get(getAllMovies);	

router.route("/count")	
	.get(getMovieCount);



// Single Movie
router
	.route("/:id")
	.get(getMovie)
	.put(secureRoute, updateMovie)
	.delete(secureRoute, deleteMovie);

// Movie Reviews
router.route("/:id/reviews")
	.post(secureRoute, addMovieReview);
// Single Movie Review
router.route("/:id/reviews/:reviewId")
	.put(secureRoute, updateMovieReview)
	.delete(secureRoute, deleteMovieReview);

	

// Movies By Genre	


router.route("/genre/:genreId")
	.get(getMoviesByGenre);


export default router;