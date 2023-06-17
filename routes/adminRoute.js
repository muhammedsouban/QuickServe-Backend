import express from "express";
const adminRoute = express.Router()
import * as adminController from '../controller/adminController.js'
import { verifyAdminToken } from '../middleware/Auth.js'
import { upload } from "../middleware/multer.js";

adminRoute.post('/login', adminController.adminLogin)

adminRoute.post('/category', verifyAdminToken, upload.single('image'), adminController.AddCategory)
adminRoute.get('/category', adminController.getCategory)
adminRoute.delete('/category/:Id', verifyAdminToken, adminController.deleteCategory)
adminRoute.get('/category/:Id', verifyAdminToken, adminController.editCategory)
adminRoute.put('/category/:Id', verifyAdminToken, upload.single('image'), adminController.updateCategory)

adminRoute.get('/service', adminController.getServices)
adminRoute.post('/service', verifyAdminToken, upload.single('image'), adminController.AddService)
adminRoute.delete('/service/:serviceId', verifyAdminToken, adminController.DeleteService)
adminRoute.get('/service/:serviceId', adminController.EditService)
adminRoute.put('/service/:serviceId', verifyAdminToken, upload.single('image'), adminController.UpdateService)

adminRoute.get('/providers', verifyAdminToken, adminController.getProvider)
adminRoute.put('/provider-Block/:providerId', verifyAdminToken, adminController.blockProvider)
adminRoute.put('/provider-Unblock/:providerId', verifyAdminToken, adminController.UnBlockProvider)
adminRoute.put('/provider-Approve/:providerId', verifyAdminToken, adminController.ApproveProvider)

adminRoute.get('/users', verifyAdminToken, adminController.users)
adminRoute.put('/user-BlockHandle/:userId', verifyAdminToken, adminController.handleUserBlock)

adminRoute.get('/city', adminController.cities)
adminRoute.post('/city', verifyAdminToken, adminController.addCity)
adminRoute.delete('/city/:cityId', verifyAdminToken, adminController.deleteCity)

adminRoute.post('/media-card', upload.array('images'), adminController.AddMediaCards)
adminRoute.put('/media-card/:id', upload.array('images'), adminController.updateMediaCard)
adminRoute.get('/media-card/:id', adminController.getMediaCard)
adminRoute.delete('/media-card/:id', adminController.deleteMediaCards)

adminRoute.post('/media-add', upload.single('image'), adminController.addAdvertisement)
adminRoute.put('/media-add/:id', upload.single('image'), adminController.editAdvt)
adminRoute.get('/media-add/:id', adminController.getAdvt)
adminRoute.delete('/media-add/:id', adminController.deleteAdvertisement)

adminRoute.post('/media-banner', upload.single('image'), adminController.addBanner)
adminRoute.get('/media-banner/:id', adminController.getBanner)
adminRoute.put('/media-banner/:id', upload.single('image'), adminController.editBanner)
adminRoute.delete('/media-banner/:id', adminController.deleteBanner)

adminRoute.get('/media', adminController.getMedia)

adminRoute.get('/bookings', verifyAdminToken, adminController.bookings)

adminRoute.get('/chat', verifyAdminToken, adminController.getChat)
adminRoute.post('/chat', verifyAdminToken, adminController.AddChat)
adminRoute.get('/conversation/:userId', verifyAdminToken, adminController.getConversation)

adminRoute.get('/dashboard', verifyAdminToken, adminController.Dashboard)

export default adminRoute