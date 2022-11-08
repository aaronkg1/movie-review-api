import Genre from "../models/genre.js";
import Media from "../models/media.js";
import cloudinary from "../utils/cloudinary.js";

export const getMovieCount = async (req, res) => {
	try {
		const count = await Media.count({type: "movie"});
		return res.status(200).json(count);
	} catch (error) {
		return res.status(404).json({ message: "A problem occured" });
	}
}

export const getAllMovies = async (req, res) => {
	try {
		let skips;
		const { pageNumber } = req.params;
		if (!pageNumber) skips = 0;
		else if (pageNumber) skips = 16*(pageNumber-1);
		const movies = await Media.find({ type: "movie" })
			.skip(skips)
			.limit(16)
			.populate(['genre'])
			.sort({title: "asc"});
		return res.status(200).json([...movies]);	
	}
	catch(error) {
		return res.status(404).json({ message: "No movies found" });
	}
}

export const postNewMovie = async (req, res) => {
	let image;
	try {
		if (!req.body.image.length) throw new Error({message: "image required"});
		image = await cloudinary.uploader.upload(req.body.image, {
			folder: "movies",
			width: 1500, height: 2000,
			colors: true
		});
		console.log(image);
	} catch (_error) {
		return res.status(422).json({errors: {image: 'Valid image required'}});
	}
	try {
		const movie = await Media.create({
			...req.body,
			owner: req.currentUser._id,
			image: {
				public_id: image.public_id,
				url: image.secure_url,
				main_color: image.colors[0][0],
				secondary_color: image.colors[1][0],
			},
		});
		res.status(201).json({ movie });
	} catch (err) {
		return res.status(422).json(err);
	}
};

export const getMovie = async (req, res) => {
	try {
		const { id } = req.params;
		const movie = await Media.findById(id)
			.populate("owner")
			.populate("reviews.owner")
			.populate("genre");
		return res.status(200).json(movie);
	} catch (error) {
		return res.status(404).json(error.message);
	}
};


export const getMoviesByGenre = async (req, res) => {
	try {
		const { genreId } = req.params;
		console.log(req.params)
		const movies = await Media.find({type: 'movie', genre: genreId}).sort({title: "asc"});
		if (!movies.length) throw new Error("No movies found");
		const genre = await Genre.findById(genreId);
		return res.status(200).json({movies: [...movies], genre: genre});
	}
	catch(error) {
		return res.status(404).json(error.message)
	}
}

export const deleteMovie = async (req, res) => {
	try {
		const { id } = req.params;
		const movieToDelete = await Media.findById(id);
		if (!movieToDelete.owner.equals(req.currentUser._id)) {
			throw new Error("Unauthorized");
		}
		await movieToDelete.remove();
		return res.sendStatus(204);
	} catch (error) {
		return res.status(422).json(error);
	}
};

export const updateMovie = async (req, res) => {
	try {
		const { id } = req.params;
		const movieToUpdate = await Media.findById(id);
		// Check owner field of movie to the id of the current user
		// If they do not match then throw an error
		if (!movieToUpdate.owner.equals(req.currentUser._id)) {
			throw new Error("Unauthorized");
		}
		Object.assign(movieToUpdate, req.body);
		await movieToUpdate.save();
		return res.status(202).json(movieToUpdate);
	} catch (err) {
		return res.status(422).json(err);
	}
};

export const addMovieReview = async (req, res) => {
	try {
		const { id } = req.params;
		const movieToReview = await Media.findById(id);
		if (!movieToReview) throw new Error("Movie not found");
		// Query to find a document that has a review written by the current user, if that exists throw an error
		const currentReviews = await Media.findOne({
			_id: id,
			reviews: { $elemMatch: { owner: req.currentUser } },
		});
		if (currentReviews) throw new Error("You have already reviewed this film");
		movieToReview.reviews.push({ ...req.body, owner: req.currentUser._id });
		await movieToReview.save();
		return res.status(202).json(movieToReview);
	} catch (err) {
		return res.status(422).json({ message: err.message });
	}
};
export const updateMovieReview = async (req, res) => {
	try {
		const { id, reviewId } = req.params;
		const movieWithReview = await Media.findById(id);
		if (!movieWithReview) throw new Error("Movie not found");
		const toUpdate = movieWithReview.reviews.id(reviewId);
		if (!toUpdate) throw new Error("Review not found");
		if (!toUpdate.owner.equals(req.currentUser._id))
			throw new Error("Unauthorised");
		Object.assign(toUpdate, req.body);
		await movieWithReview.save();
		return res.status(202).json(movieWithReview);
	} catch (err) {
		return res.status(422).json({ message: err.message });
	}
};

export const deleteMovieReview = async (req, res) => {
	try {
		const { id, reviewId } = req.params;
		const movieWithReview = await Media.findById(id);
		if (!movieWithReview) throw new Error("Movie not found");
		const review = movieWithReview.reviews.id(reviewId);
		if (!review) throw new Error("Review not found");
		if (!review.owner.equals(req.currentUser._id))
			throw new Error("Unauthorised");
		review.remove();
		await movieWithReview.save();
		return res.sendStatus(204);
	} catch (error) {
		return res.status(422).json(error);
	}
};

export const searchAllMedia = async (req, res) => {
	try {
		const { searchParams } = req.params;
		console.log(req.params)
		const mediaQuery = await Media.find({$text: {$search: searchParams}});
		if (!mediaQuery.length) throw new Error("No media found");
		return res.status(200).json([...mediaQuery]);
	} catch (error) {
		return res.status(404).json(error);
	}
}


