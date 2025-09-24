import getDashBoardData from "../controller/dashboard.controll";
import express from "express"

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboardRoute", getDashBoardData);

export default dashboardRouter;