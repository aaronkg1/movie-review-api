import Genre from "../models/genre.js";

export const getAllGenres = async (req, res) => {
   try {
    const genres = await Genre.find().sort({title: 'asc'});
    res.status(200).json([...genres]);
   } catch (error) {
    res.status(404).json({message: error.message});
   }
}