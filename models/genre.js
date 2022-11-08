import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const { Schema, model } = mongoose;

const genreSchema = new Schema({
    title: {type: String, required: true},

});

genreSchema.virtual(`media`, {
    ref: 'Media',
    localField: '_id',
    foreignField: 'genre'
});

genreSchema.plugin(uniqueValidator);

export default model('Genre', genreSchema);