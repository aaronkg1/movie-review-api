import express from "express";
const router = express.Router();
import { secureRoute } from "./secureRoute.js";

import {
	addShowReview,
	deleteShow,
	deleteShowReview,
	getAllTvShows,
	getShowCount,
	getTvShow,
	getTvShowsByGenre,
	postNewShow,
	updateShow,
	updateShowReview,
} from "../controllers/shows.js";

router.route("/")
	.get(getAllTvShows)
	.post(secureRoute, postNewShow);
router.route("/page/:pageNumber")
	.get(getAllTvShows);	
	

router.route("/count")
	.get(getShowCount);	
// Single TV Show
router
	.route("/:id")
	.get(getTvShow)
	.put(secureRoute, updateShow)
	.delete(secureRoute, deleteShow);
// TV Show reviews
router.route("/:id/reviews")
	.post(secureRoute, addShowReview);
// Single TV Show review
router
	.route("/:id/reviews/:reviewId")
	.put(secureRoute, updateShowReview)
	.delete(secureRoute, deleteShowReview);

router.route("/genre/:genreId")
	.get(getTvShowsByGenre);



export default router;	