import express from "express";
const userRoute = express.Router()
import * as userController from '../controller/userController.js'
import { verifyToken } from '../middleware/Auth.js'
import { upload } from "../middleware/multer.js";


userRoute.post('/register', upload.single('image'), userController.insertUser)
userRoute.post('/login', userController.Login)
userRoute.post('/refresh-tokens', userController.refreshTokens);
userRoute.patch('/profile-update', upload.single('image'), verifyToken, userController.UpdateProfile)
userRoute.post('/cart/:serviceId', verifyToken, userController.AddToCart)
userRoute.get('/cart', verifyToken, userController.getCart)
userRoute.delete('/cart/:serviceId', verifyToken, userController.RemoveCart)
userRoute.post('/address', verifyToken, userController.addAddress)
userRoute.get('/address', verifyToken, userController.getaddress)
userRoute.delete('/address/:id', verifyToken, userController.DeleteAddress)
userRoute.post('/booking', verifyToken, userController.AddBooking)
userRoute.get('/profile', verifyToken, userController.Profile)
userRoute.get('/bookings', verifyToken, userController.getBookings)
userRoute.post('/chat', verifyToken, userController.AddChat)
userRoute.post('/conversation', verifyToken, userController.createConversation)
userRoute.get('/chat', verifyToken, userController.getChat)
userRoute.get('/media', userController.getMedia)
userRoute.post('/review', verifyToken, userController.AddReview)
userRoute.get('/service/:serviceId', userController.serviceDetails)
userRoute.get('/review/:serviceId', userController.getReview)






export default userRoute