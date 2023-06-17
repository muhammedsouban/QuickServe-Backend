import express from "express";
const providerRoute = express.Router()
import * as providerController from '../controller/providerController.js'
import { verifyProviderToken } from '../middleware/Auth.js'
import { upload } from "../middleware/multer.js";


providerRoute.post('/register', upload.single('image'), providerController.registerProvider)
providerRoute.post('/login', providerController.providerLogin)
providerRoute.get('/bookingRequests', verifyProviderToken, providerController.sendBookingRequest)
providerRoute.get('/profile', verifyProviderToken, providerController.Profile)
providerRoute.put('/acceptBooking', verifyProviderToken, providerController.acceptRequest)
providerRoute.get('/upcoming', verifyProviderToken, providerController.upcomingJob)
providerRoute.get('/completed', verifyProviderToken, providerController.completedBooking)

providerRoute.post('/start-job', verifyProviderToken, providerController.startJob)
providerRoute.get('/dashboard', verifyProviderToken, providerController.Dashboard)



export default providerRoute