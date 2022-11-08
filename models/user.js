import { Schema, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import bcrypt from "bcrypt";

// username
// email
// password
// passwordConfirmation

// This would be duplicate info we only need for validation
const userSchema = new Schema({
	username: { type: String, required: true, unique: true, maxLength: 30 },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

userSchema.virtual("ownedMedia", {
	ref: "Media",
	localField: "_id", // localField is the _id field of the user document
	foreignField: "owner",
});

userSchema.virtual("reviews", {
	ref: "Media",
	localField: "_id",
	foreignField: "reviews.owner",
});

// toJSON essentially hooks into the point when document data is converted to JSON and allows us to apply
// options
userSchema.set("toJSON", {
	virtuals: true,
	// transform allows us to mutate the json being returned when document is queried and converted
	transform(_doc, json) {
		delete json.password;
		return json;
	},
});

// Creating password confirmation virtual field
userSchema.virtual("passwordConfirmation").set(function (passwordConfirmation) {
	this._passwordConfirmation = passwordConfirmation;
});

// method .pre() on the userSchema or any Schema instance allows us to add extra steps of validation

// STEPS OF VALIDATION
// * respresents default validation
// custom pre validate - Check that passwordConfirmation matches password
// * validation - default validation checks all the settings in the Schema
// custom pre save == Hashing our password to store in the database
// * save - default behaviour, saves to database

// Custom pre valiation
// Here we will check that passwords match one another
// pre takes two arguments
// first is the stage we want to execute a callback before
// second is the callback

userSchema.pre("validate", function (next) {
	// Check that the password is being modified/created
	// Check passwordConfirmation matches password
	if (
		this.isModified("password") &&
		this.password !== this._passwordConfirmation
	) {
		// if we wish to invalidate the request, there's a method for that
		// The invalidate() method takes two arguments
		// first argument is going to be the field in which the invalidation occured
		// second one is going to be the error message
		this.invalidate("passwordConfirmation", "Does not match password field");
	}
	next(); // if password is not being modified
	// or password matches password confirmation move to next stage of validation
});

// Customer pre save
// Use bcrypt to hash the plain text password hashed by the user

userSchema.pre("save", function (next) {
	if (this.isModified("password")) {
		// bcrypt.hashSync takes in two arguments
		// first argument is the data to be encrypted - in this case it is the pasword field
		// second argument is going to be the salt or rounds
		// in the second argument we can use genSaltSync() to generate this for us, (optionally passing in the number of rounds)
		this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync());
	}
	next(); // happy to move onto the stage step
});

userSchema.plugin(uniqueValidator);

// This function is going to validate the password that the user submits during login,
// we will use bcrypt and a method it provides called compareSync to check the stored hash
// against the text password
// every schema instace of a schema provides us with a methods key. This is a way to attach a custom method
// to an existing schema

userSchema.methods.validatePassword = function (password) {
	// password argument is going to represent the plain text pasword from req.body.password
	return bcrypt.compareSync(password, this.password);
};

export default model("User", userSchema);
