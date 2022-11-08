import express from "express";
import { searchAllMedia } from "../controllers/movies.js";
const router = express.Router();

router.route('/:searchParams')
    .get(searchAllMedia);

export default router;    