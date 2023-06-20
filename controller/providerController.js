import jwt from 'jsonwebtoken'
import Service from "../models/serviceModel.js";
import Provider from '../models/providerModel.js';
import Booking from '../models/bookingModel.js'
import User from '../models/userModel.js'

import bcrypt from 'bcrypt'
import mongoose from 'mongoose';

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
export const registerProvider = async (req, res) => {
    try {
        const { username, email, phone, location, pincode, address, password, category, experience, availability, languages, description } = req.body;
        const imageUrl = req.file.filename
        const userData = await Provider.findOne({ email: req.body.email });
        if (!userData) {
            const secretPassword = await securePassword(password);
            const provider = new Provider({
                providername: username,
                email: email,
                phone: phone,
                location: location,
                address: address, language: languages,
                category: category, availability: availability,
                pincode: pincode, experience: experience,
                image: imageUrl, jobdescription: description,
                password: secretPassword,
            });
            const ProviderData = await provider.save();
            res.json(ProviderData);
        } else {
            res.json({ message: "Email already taken" });
        }
    } catch (error) {
        console.log(error);
    }
}

export const providerLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const provider = await Provider.findOne({ email: email });
        if (provider) {
            if (!provider.isApproved) {
                return res.json({ message: "Account not approved. Please contact the administrator." });
            }
            if (provider.isBlock) {
                return res.json({ message: "Account blocked. Please contact the administrator." });
            }
            const passwordMatch = await bcrypt.compare(password, provider.password);
            if (passwordMatch) {
                const token = jwt.sign({ email: provider.email, id: provider._id, role: 'provider' }, process.env.JWT_SECRET_KEY);
                return res.json({ message: "Login Success", token, email: provider.email, id: provider._id });
            } else {
                return res.json({ message: "Wrong password" });
            }
        } else {
            return res.json({ message: "Wrong Email" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const sendBookingRequest = async (req, res) => {
    try {
        const provider = await Provider.findById(req.provider.id);
        const providerCategory = provider.category;

        const BookingRequests = await Booking.aggregate([
            {
                $unwind: "$services"
            },
            {
                $lookup: {
                    from: "services",
                    localField: "services.serviceId",
                    foreignField: "_id",
                    as: "serviceData"
                }
            },
            {
                $unwind: "$serviceData"
            },
            {
                $match: {
                    "serviceData.category": providerCategory,
                    "services.providerId": { $exists: false }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    bookingId: { $first: "$_id" },
                    services: {
                        $push: {
                            serviceId: "$services.serviceId",
                            qty: "$services.qty",
                            serviceData: "$serviceData"
                        }
                    },
                    user: { $first: "$user" },
                    addressId: { $first: "$addressId" },
                    date: { $first: "$date" },
                    startTime: { $first: "$startTime" },
                }
            },
            {
                $project: {
                    _id: 0,
                    bookingId: 1,
                    services: 1,
                    user: 1,
                    addressId: 1,
                    date: 1,
                    startTime: 1,
                }
            }
        ]);
        res.json(BookingRequests);

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
};



export const acceptRequest = async (req, res) => {
    try {
        const { services, bookingId: bookingIdString } = req.body.data;
        const bookingId = new mongoose.Types.ObjectId(bookingIdString);
        const serviceIds = services.map((item) => new mongoose.Types.ObjectId(item.serviceId));
        const providerId = new mongoose.Types.ObjectId(req.provider.id);

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { 'services.$[elem].providerId': providerId } },
            { arrayFilters: [{ 'elem.serviceId': { $in: serviceIds } }], new: true }
        );

        let hasProviderId = true;
        booking.services.forEach((item) => {
            if (!item.providerId) {
                hasProviderId = false;
            }
        });

        if (hasProviderId) {
            const status = await Booking.findByIdAndUpdate(
                bookingId,
                { $set: { status: 'Accepted' } },
                { new: true }
            );
        }
        return res.status(200).json({ success: true, message: 'Booking request accepted.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: 'Error accepting booking request.' });
    }
};


export const upcomingJob = async (req, res) => {
    try {
        const providerId = req.provider.id;
        const BookingData = await Booking.aggregate([
            {
                $unwind: "$services"
            },
            {
                $match: {
                    "services.providerId": new mongoose.Types.ObjectId(providerId),
                    "services.status": { $ne: "Completed" }
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "services.serviceId",
                    foreignField: "_id",
                    as: "serviceData"
                }
            },
            {
                $unwind: "$serviceData"
            },
            {
                $group: {
                    _id: "$_id",
                    bookingId: { $first: "$_id" },
                    booking: { $first: "$BookingID" },
                    services: {
                        $push: {
                            serviceId: "$services.serviceId",
                            qty: "$services.qty",
                            serviceData: "$serviceData"
                        }
                    },
                    user: { $first: "$user" },
                    addressId: { $first: "$addressId" },
                    date: { $first: "$date" },
                    startTime: { $first: "$startTime" },
                }
            },
            {
                $project: {
                    _id: 0,
                    booking: 1,
                    bookingId: 1,
                    services: 1,
                    user: 1,
                    addressId: 1,
                    date: 1,
                    startTime: 1,
                }
            }
        ]);
        res.send(BookingData);
    } catch (error) {
        console.log(error);
    }
}

export const completedBooking = async (req, res) => {
    try {
        const providerId = req.provider.id;
        const BookingData = await Booking.aggregate([
            {
                $unwind: "$services"
            },
            {
                $match: {
                    "services.providerId": new mongoose.Types.ObjectId(providerId),
                    "services.status": "Completed"
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "services.serviceId",
                    foreignField: "_id",
                    as: "serviceData"
                }
            },
            {
                $unwind: "$serviceData"
            },
            {
                $group: {
                    _id: "$_id",
                    bookingId: { $first: "$_id" },
                    booking: { $first: "$BookingID" },
                    services: {
                        $push: {
                            serviceId: "$services.serviceId",
                            qty: "$services.qty",
                            serviceData: "$serviceData"
                        }
                    },
                    user: { $first: "$user" },
                    addressId: { $first: "$addressId" },
                    date: { $first: "$date" },
                    startTime: { $first: "$startTime" },
                }
            },
            {
                $project: {
                    _id: 0,
                    booking: 1,
                    bookingId: 1,
                    services: 1,
                    user: 1,
                    addressId: 1,
                    date: 1,
                    startTime: 1,
                }
            }
        ]);
        res.json(BookingData);
    } catch (error) {
        console.log(error);
    }
};


export const startJob = async (req, res) => {
    try {
        const { services, bookingId: bookingIdString,BookingID } = req.body.data;
        const bookingId = new mongoose.Types.ObjectId(bookingIdString);
        const serviceIds = services.map((item) => new mongoose.Types.ObjectId(item.serviceId));
        
        const booking = await Booking.findByIdAndUpdate(
            { _id: bookingId, BookingID },
            { $set: { 'services.$[elem].status': 'Completed' } },
            { arrayFilters: [{ 'elem.serviceId': { $in: serviceIds } }], new: true }
        );

        let allServicesCompleted = true;
        booking.services.forEach((item) => {
            if (item.status !== 'Completed') {
                allServicesCompleted = false;
                return;
            }
        });

        if (allServicesCompleted) {
            const status = await Booking.findByIdAndUpdate(
                bookingId,
                { $set: { status: 'Completed' } },
                { new: true }
            );
        }
        res.status(200).json(booking)

    } catch (error) {
        console.log(error);
    }
}





export const Profile = async (req, res) => {
    try {
        const ProviderData = await Provider.findById(req.provider.id)
        res.json(ProviderData)
    } catch (error) {
        console.log(error);
    }
}


export const Dashboard = async (req, res) => {
    try {
        const dashboardData = {};
        const providerId = new mongoose.Types.ObjectId(req.provider.id);
        const provider = await Provider.findById(providerId, { category: 1 });
        const providerCategory = provider.category;

        dashboardData.Upcoming = (await Booking.aggregate([
            { $unwind: "$services" },
            { $match: { "services.providerId": providerId, "services.status": { $ne: "Completed" } } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ]))[0]?.count || 0;

        dashboardData.Requests = (await Booking.aggregate([
            { $unwind: "$services" },
            {
                $lookup: {
                    from: "services",
                    localField: "services.serviceId",
                    foreignField: "_id",
                    as: "serviceData"
                }
            },
            { $unwind: "$serviceData" },
            { $match: { "serviceData.category": providerCategory, "services.providerId": { $exists: false } } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ]))[0]?.count || 0;

        dashboardData.completed = (await Booking.aggregate([
            { $unwind: "$services" },
            { $match: { "services.providerId": providerId, "services.status": "Completed" } },
            { $count: "count" },
            { $project: { _id: 0, count: { $ifNull: ["$count", 0] } } }
        ]))[0]?.count || 0;

        const earningByMonth = await Booking.aggregate([
            { $unwind: "$services" },
            { $match: { "services.providerId": providerId, "services.status": "Completed" } },
            {
              $lookup: {
                from: "services",
                localField: "services.serviceId",
                foreignField: "_id",
                as: "service"
              }
            },
            { $unwind: "$service" },
            {
              $group: {
                _id: { $month: { $toDate: "$date" } },
                totalPrice: {
                  $sum: {
                    $multiply: [
                      { $toInt: "$services.quantity" },
                      { $toDouble: "$service.price" }
                    ]
                  }
                }
              }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, month: { $toInt: { $toString: "$_id" } }, totalPrice: 1 } }
          ]);
          
          const currentMonth = new Date().getMonth();
          dashboardData.earningsByMonth = Array.from({ length: currentMonth + 1 }, () => 0);
          earningByMonth.forEach(booking => {
            const monthIndex = booking.month - 1;
            dashboardData.earningsByMonth[monthIndex] += booking.totalPrice;
          });
          
        dashboardData.earnings = earningByMonth.reduce((acc, curr) => acc + curr.totalPrice, 0);

        res.json(dashboardData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


