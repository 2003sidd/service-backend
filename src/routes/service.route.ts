import express from "express"
import { getAllServices, getAllServicesAdmin, getServiceById, toggleServiceStatus, upsertService } from "../controller/service.controller";
const serviceRouter = express.Router();

serviceRouter.get("/getService", getAllServices);
serviceRouter.get("/toggleService/:id", toggleServiceStatus);
serviceRouter.post("/upsertService", upsertService);
serviceRouter.post("/getAllService", getAllServicesAdmin);
serviceRouter.get("/getService/:id", getServiceById);

export default serviceRouter