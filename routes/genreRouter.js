import express from "express";
import { getAllGenres } from "../controllers/genres.js";

const router = express.Router();

router.route("/")
    .get(getAllGenres);

export default router;