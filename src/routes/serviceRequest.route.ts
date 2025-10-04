import express from "express"
import { addServiceRequest, changeServiceRequestStatus, getAllServiceRequests, getAllServiceRequestsByUser, getServiceRequestById, updateServiceRequest } from "../controller/serviceRequest.controller";
const serviceRequestRouter = express.Router();;


serviceRequestRouter.get("/getRequest/:id", getServiceRequestById)
serviceRequestRouter.get("/getRequestUser", getAllServiceRequestsByUser)
serviceRequestRouter.get("/getRequests", getAllServiceRequests)
serviceRequestRouter.post("/addRequest", addServiceRequest)
serviceRequestRouter.post("/updateRequest", updateServiceRequest)
serviceRequestRouter.get("/updateStatusRequest", changeServiceRequestStatus)

export default serviceRequestRouter; 