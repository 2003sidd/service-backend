import express from "express"
import { getAllServices, getAllServicesAdmin, getServiceById, toggleServiceStatus, upsertService } from "../controller/service.controller";
import { authorize } from "../middleware/jwt";
const serviceRouter = express.Router();

serviceRouter.get("/getService", getAllServices);
serviceRouter.get("/toggleService/:id", toggleServiceStatus);
serviceRouter.post("/upsertService", authorize(), upsertService);
serviceRouter.get("/getAllService", getAllServicesAdmin);
serviceRouter.get("/getService/:id", getServiceById);

export default serviceRouter