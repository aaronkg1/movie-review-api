import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const { Schema, model } = mongoose;
// Schemas define the document, but we need to attach it to a model so that we can interact with the database;
// mongoose.model takes two arguments:
// first argument is the name of the collection, this will be capitalised but will
// be created all lowercase
// Second argument is the schema

// Owner field
// Text
// Rating, we will use these ratings to create a virtual average rating field
// Timestamp - This is added as an option. Options are the second argument when definining a Schema
// Timestamps: true adds a createdAt and updatedAt field to the Schema

const reviewSchema = new Schema(
	{
		text: { type: String, required: true, maxLength: 300 },
		rating: { type: Number, required: true, min: 1, max: 5 },
		owner: { type: Schema.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
	}
);

// Reviews is an array, making it a one-to-many embedded relationship
// One to many part means that one movie can have many reviews
// The embedded part is because we've embedded a Schema within another Schema

const noGenreMessage = 'Must have at least one genre';
const noCastMessage = 'Must have at least one cast member';
const isEmpty = (field) => {
	if (!field.length) return false
	return true;
}

const mediaSchema = new Schema({
	type: { type: String, required: true },
	season: { type: Number },
	title: { type: String, required: true, unique: true },
	year: { type: Number, required: true },
	director: { type: String, required: true },
	description: { type: String, required: true, maxLength: 500 },
	cast: {type: [{type: String}], required: true, validate: [isEmpty, noCastMessage]},
	genre: { type: [{type: Schema.ObjectId, ref: "Genre"}], required: true, validate: [isEmpty, noGenreMessage]},
	owner: { type: Schema.ObjectId, ref: "User", required: true },
	image: { public_id: {
		type: String,
		required: true,
	}, url: {
		type: String,
		required: true
	}, main_color: {
		type: String,
	}, secondary_color: {
		type: String
	}},
	reviews: [reviewSchema],
});

mediaSchema.index({'$**': 'text'});

// Define a virtual field: "avgRating" that will take all the ratings already on the db
// And create an average

mediaSchema.virtual("avgRating").get(function () {
	if (!this.reviews.length) {
		return "No rating";
	}
	const sum = this.reviews.reduce((acc, review) => {
		return acc + Number(review.rating);
	}, 0);
	return (sum / this.reviews.length).toFixed(2);
});

mediaSchema.set("toJSON", {
	virtuals: true,
});

mediaSchema.plugin(uniqueValidator);
export default model("Media", mediaSchema);
