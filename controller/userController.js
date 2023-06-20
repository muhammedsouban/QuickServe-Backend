import User from "../models/userModel.js";
import Booking from '../models/bookingModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import Admin from "../models/adminModel.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageMode.js";
import Media from "../models/mediaModel.js"
import Review from "../models/reviewModel.js";
import Service from '../models/serviceModel.js'


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

export const insertUser = async (req, res) => {
    try {
        const { username, email, mobile, password } = req.body;
        const imageUrl = req.file.filename
        const userData = await User.findOne({ email: req.body.email });
        if (!userData) {
            const secretPassword = await securePassword(password);
            const user = new User({
                username: username,
                email: email,
                mobile: mobile,
                image: imageUrl,
                password: secretPassword,
            });
            const userData = await user.save();
            res.json(userData);
        } else {
            res.json({ message: "Email already taken" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
};

export const refreshTokens = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.json({ error: 'Invalid refresh token' });
            }
            const accessToken = jwt.sign(
                { username: decoded.username, email: decoded.email, id: decoded.id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '15m' }
            );
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
        res.json({ error: 'Internal server error' });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ error: 'Email or Password incorrect' });
        }
        if (userData.isBlocked) {
            return res.json({ error: 'Your account is blocked' });
        }
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.json({ error: 'Email or Password incorrect' });
        }
        const token = jwt.sign(
            { username: userData.username, email: userData.email, id: userData._id },
            process.env.JWT_SECRET_KEY
        );
        const refreshToken = jwt.sign(
            { username: userData.username, email: userData.email, id: userData._id },
            process.env.REFRESH_TOKEN_SECRET
        );

        res.json({ userData, token, refreshToken });
    } catch (error) {
        console.log(error);
    }
};



export const Profile = async (req, res) => {
    try {
        const id = req.user.id
        const userData = await User.findOne({ _id: id })
        res.json(userData)
    } catch (error) {
        console.log(error);
    }
}

export const UpdateProfile = async (req, res) => {
    try {
        const id = req.decode.id;
        const { username, email, mobile } = req.body;
        const updateData = {
            username: username,
            email: email,
            mobile: mobile
        };
        if (req.file?.filename) {
            updateData.image = req.file.filename;
        }
        const userData = await User.findOneAndUpdate({ _id: id }, { $set: updateData });
        res.json(userData);
    } catch (error) {
        console.log(error);
    }
};


export const AddToCart = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.user.id);
        const serviceId = new mongoose.Types.ObjectId(req.params.serviceId);

        const Cart = await User.updateOne(
            { _id: id },
            {
                $addToSet: {
                    Cart: serviceId
                }
            }
        );

        if (Cart.modifiedCount === 0) {
            res.json({ message: 'Service Already Exists in Cart' });
        } else {
            res.json({ message: 'Service Added to Cart Successfully', Cart });
        }
    } catch (error) {
        console.log(error);
    }
};



export const getCart = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.user.id);
        const cartData = await User.aggregate([
            { $match: { _id: id } },
            {
                $lookup: {
                    from: 'services',
                    localField: 'Cart',
                    foreignField: '_id',
                    as: 'CartItems'
                }
            }
        ]);

        res.status(200).json(cartData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const RemoveCart = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.user.id);
        const serviceId = new mongoose.Types.ObjectId(req.params.serviceId);

        await User.updateOne(
            { _id: id },
            {
                $pull: {
                    Cart: serviceId
                }
            }
        );
        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const addAddress = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.user.id);
        const addressId = new mongoose.Types.ObjectId();
        const newAddress = { ...req.body, id: addressId };
        const Address = await User.findByIdAndUpdate({ _id: id },
            {
                $addToSet: {
                    Address: newAddress
                }
            }
        );
        res.json('address added successfully')
    } catch (error) {
        console.log(error);
    }
};
export const DeleteAddress = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const userData = await User.findByIdAndUpdate({ _id: userId }, {
            $pull: {
                Address: { id: new mongoose.Types.ObjectId(req.params.id) }
            }
        })
        res.json(userData)
    } catch (error) {
        console.log(error)
    }
}
export const getaddress = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const user = await User.findById(userId).lean();
        const addresses = user.Address;
        res.json(addresses);
    } catch (error) {
        console.log(error);
    }
}
function generateBookingId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    const letter = letters[Math.floor(Math.random() * letters.length)];
    let digitsPart = '';

    for (let i = 0; i < 6; i++) {
        const digit = digits[Math.floor(Math.random() * digits.length)];
        digitsPart += digit;
    }

    return letter + digitsPart;
}

export const AddBooking = async (req, res) => {
    try {

        const data = req.body
        const bookingId = generateBookingId();
        const newBooking = new Booking({
            BookingID: bookingId,
            userId: data.userId,
            services: data.service.map((service) => ({
                serviceId: service._id,
                quantity: service.qty,
                status: 'Pending',

            })),
            date: new Date(data.dateTime[0]),
            startTime: data.dateTime[1],
            totalPrice: data.totalPrice,
            address: data.address,
            status: 'Pending'

        });
        const BookingData = await newBooking.save();
        const user = await User.findOne({ _id: data.userId })
        user.Cart = [];
        await user.save();

    } catch (error) {
        console.log(error);
    }
}

export const getBookings = async (req, res) => {
    try {
        const userId = req.user.id
        const bookings = await Booking.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'services.serviceId',
                    foreignField: '_id',
                    as: 'serviceData',
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]).exec();


        res.status(200).json(bookings);
    } catch (error) {
        console.log(error);

    }
}

export const AddChat = async (req, res) => {
    try {
        const { sender, message, conversationId } = req.body.data
        const newMessage = new Message({
            sender: sender,
            message: message,
            conversationId: conversationId,
        });

        const savedMessage = await newMessage.save();

        res.status(200).json({
            message: savedMessage,
        });
    } catch (error) {
        console.error('Error adding chat:', error);
        res.status(500).json({ error: 'An error occurred while adding the chat.' });
    }
};

export const createConversation = async (req, res) => {
    try {
        const admin = await Admin.findOne();
        const user = req.body.user;

        const conversation = new Conversation({
            admin_id: admin._id,
            user_id: user,
        });

        const savedConversation = await conversation.save();
        res.status(200).json({
            conversation: savedConversation,
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'An error occurred while creating the conversation.' });
    }
};


export const getChat = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const chatData = await Conversation.aggregate([
            {
                $match: {
                    user_id: userId
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: '_id',
                    foreignField: 'conversationId',
                    as: 'messages'
                }
            }
        ]);

        if (chatData.length === 0) {
            res.json(null);
        } else {
            const chat = chatData[0];
            res.json(chat);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve chat data' });
    }
};

export const getMedia = async (req, res) => {
    try {
        const media = await Media.find().lean()
        res.json(media[0]);
    } catch (error) {
        console.log(error);
    }
}

export const AddReview = async (req, res) => {
    try {
        const { userId, rating, feedback, serviceIDs } = req.body.data;

        const review = new Review({
            userId,
            rating,
            feedback,
            services: serviceIDs.map((item) => ({ serviceId: item._id })),
        });

        await review.save();

        res.status(200).json({ message: 'Review saved successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error saving review' });
    }
};

export const serviceDetails = async (req, res) => {
    try {
        const serviceData = await Service.findOne({ _id: new mongoose.Types.ObjectId(req.params.serviceId) })
        res.status(200).json(serviceData);
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getReview = async (req, res) => {
    const { serviceId } = req.params;
    try {
        const Reviews = await Review.aggregate([
            {
                $match: {
                    "services.serviceId": new mongoose.Types.ObjectId(serviceId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    feedback: 1,
                    date:1,
                    user: {
                        username: 1,
                        image:1
                    }
                }
            }
        ]);

        res.status(200).json(Reviews);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




