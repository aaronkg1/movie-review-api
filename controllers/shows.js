import Media from "../models/media.js";
import Genre from "../models/genre.js";
import cloudinary from "../utils/cloudinary.js";

export const getShowCount = async (req, res) => {
	try {
		const count = await Media.count({ type: "series" });
		return res.status(200).json(count);
	} catch (error) {
		return res.status(404).json({ message: "A problem occured" });
	}
};

export const getAllTvShows = async (req, res) => {
	try {
		let skips;
		const { pageNumber } = req.params;
		if (!pageNumber) skips = 0;
		else if (pageNumber) skips = 16 * (pageNumber - 1);
		const shows = await Media.find({ type: "series" })
			.skip(skips)
			.limit(16)
			.populate(["genre"])
			.sort({ title: "asc" });
		return res.status(200).json([...shows]);
	} catch (error) {
		return res.status(404).json({ message: "No movies found" });
	}
};

export const postNewShow = async (req, res) => {
	try {
		const image = await cloudinary.uploader.upload(req.body.image, {
			folder: "shows",
			width: 1500,
			height: 2000,
			colors: true,
		});
		const show = await Media.create({
			...req.body,
			image: {
				public_id: image.public_id,
				url: image.secure_url,
				main_color: image.colors[0][0],
				secondary_color: image.colors[1][0],
			},
			owner: req.currentUser._id,
		});
		res.status(201).json({ show });
	} catch (err) {
		res.status(422).json(err);
	}
};

export const getTvShow = async (req, res) => {
	try {
		const { id } = req.params;
		const show = await Media.findById(id)
			.populate("owner")
			.populate("reviews.owner")
			.populate("genre");
		return res.status(200).json(show);
	} catch (error) {
		return res.status(404).json(error);
	}
};

export const getTvShowsByGenre = async (req, res) => {
	try {
		const { genreId } = req.params;
		console.log(req.params);
		const shows = await Media.find({ type: "series", genre: genreId }).sort({
			title: "asc",
		});
		if (!shows.length) throw new Error("No shows found");
		const genre = await Genre.findById(genreId);
		return res.status(200).json({ shows: [...shows], genre: genre });
	} catch (error) {
		return res.status(404).json(error.message);
	}
};

export const deleteShow = async (req, res) => {
	try {
		const { id } = req.params;
		const showToDelete = Media.findById(id);
		if (!showToDelete.owner.equals(req.currentUser._id)) {
			throw new Error("Unauthorized");
		}
		await showToDelete.remove();
		return res.sendStatus(204);
	} catch (err) {
		return res.status(422).json(err);
	}
};

export const updateShow = async (req, res) => {
	try {
		const { id } = req.params;
		const showToUpdate = await Media.findById(id);
		if (!showToUpdate.owner.equals(req.currentUser._id)) {
			throw new Error("Unauthorized");
		}
		Object.assign(showToUpdate, req.body);
		await showToUpdate.save();
		res.status(202).json(showToUpdate);
	} catch (err) {
		res.status(422).json(err);
	}
};

export const addShowReview = async (req, res) => {
	try {
		const { id } = req.params;
		const showToReview = await Media.findById(id);
		if (!showToReview) throw new Error("Show not found");
		// Query to find a document that has a review written by the current user, if that exists throw an error
		const currentReviews = await Media.findOne({
			_id: id,
			reviews: { $elemMatch: { owner: req.currentUser } },
		});
		if (currentReviews) throw new Error("You have already reviewed this show");
		showToReview.reviews.push({ ...req.body, owner: req.currentUser._id });
		await showToReview.save();
		return res.status(202).json(showToReview);
	} catch (err) {
		return res.status(422).json({ message: err.message });
	}
};

export const updateShowReview = async (req, res) => {
	try {
		const { id, reviewId } = req.params;
		const showWithReview = await Media.findById(id);
		if (!showWithReview) throw new Error("Show not found");
		const toUpdate = showWithReview.reviews.id(reviewId);
		if (!toUpdate) throw new Error("Review not found");
		if (!toUpdate.owner.equals(req.currentUser._id))
			throw new Error("Unauthorised");
		Object.assign(toUpdate, req.body);
		await showWithReview.save();
		return res.status(202).json(showWithReview);
	} catch (err) {
		return res.status(422).json({ message: err.message });
	}
};

export const deleteShowReview = async (req, res) => {
	try {
		const { id, reviewId } = req.params;
		const showWithReview = await Media.findById(id);
		if (!showWithReview) throw new Error("Show not found");
		const review = showWithReview.reviews.id(reviewId);
		if (!review) throw new Error("Review not found");
		if (!review.owner.equals(req.currentUser._id))
			throw new Error("Unauthorised");
		review.remove();
		await showWithReview.save();
		return res.sendStatus(204);
	} catch (error) {
		return res.status(422).json(error);
	}
};
