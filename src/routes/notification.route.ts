import getDashBoardData from "../controller/dashboard.controll";
import express from "express"
import { getAllNotification, getAllTechnicianNotification, markAsSeen } from "../controller/notification.controller";

const notificationRoute = express.Router();

notificationRoute.post("/notification", getAllNotification);
notificationRoute.post("/notificationTech", getAllTechnicianNotification);
notificationRoute.get("/seenNotification", markAsSeen);

export default notificationRoute;