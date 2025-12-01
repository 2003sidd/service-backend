import express from "express"
import { acceptRequest, addServiceRequest, assignServiceRequest, changeServiceRequestStatus, completeServiceRequest, denyRequest, getAllServiceRequests, getAllServiceRequestsByUser, getAssigndRequest, getCompletedRequest, getNewServiceRequests, getRequestAssign, getServiceRequestById, getServiceUser, getTechHeaderData, updateServiceRequest } from "../controller/serviceRequest.controller";

const serviceRequestRouter = express.Router();

serviceRequestRouter.get("/getRequest/:id", getServiceRequestById)
// serviceRequestRouter.get("/getRequestUser", getAllServiceRequestsByUser)
serviceRequestRouter.post("/getRequestUser", getServiceUser)
serviceRequestRouter.post("/getNewRequests", getNewServiceRequests)
serviceRequestRouter.post("/getRequests", getAllServiceRequests)
serviceRequestRouter.post("/addRequest", addServiceRequest)
serviceRequestRouter.post("/assignRequest", assignServiceRequest);
serviceRequestRouter.patch("/completeRequest/:id", completeServiceRequest);
serviceRequestRouter.post("/updateRequest", updateServiceRequest)
serviceRequestRouter.post("/updateStatusRequest/:id", changeServiceRequestStatus)
serviceRequestRouter.post("/getAssigndRequest", getAssigndRequest)
serviceRequestRouter.post("/getRequestAssign", getRequestAssign)
serviceRequestRouter.get("/acceptRequest/:id", acceptRequest)
serviceRequestRouter.get("/denyRequest/:id", denyRequest)
serviceRequestRouter.post("/getCompletedRequest", getCompletedRequest)
serviceRequestRouter.get("/getTechHeaderData", getTechHeaderData)

export default serviceRequestRouter;
