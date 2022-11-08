import User from "../models/user.js"

// Create a controller that receives profile information for the person making a request

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.currentUser._id)
        .populate('ownedMedia')
        .populate('reviews');
        // Check user exists
        if (!user) throw new Error('User not found')
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(404).json({message: error.message})
    }
}
export const getProfileById = async (req, res) => {
    const {id} = req.params
    try{
        const user = await User.findById(id)
        .populate('ownedMedia')
        .populate('reviews');
        // Check User exists
        if (!user) throw new Error('User not found');
        return res.status(200).json(user)
    }
    catch(err) {
        console.log(err);
        return res.status(404).json({message: err.message})
    }
    
}