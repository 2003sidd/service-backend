import { Request, Response } from "express";
import mongoose from "mongoose";
import { checkInValidEmail, checkInValidNumberField, checkInValidStringField, checkValidMongoseId, sendResponse } from "../utility/UtilityFunction";
import ServiceRequest from "../model/serviceRequest.model";
import { ServiceRequestEnum } from "../enum/serviceRequest.enum";
import serviceModel from "../model/service.model";
import logger from "../utility/wingstonLogger";
// Add Request
export const addServiceRequest = async (req: Request, res: Response) => {
    try {
        const { name, email, number,description, serviceId, subServiceId, customer, amount, address } = req.body;

        if (!checkInValidStringField(name)) return sendResponse(res, 400, "Name is a required field", null);
        if (!checkInValidStringField(address)) return sendResponse(res, 400, "Address is a required field", null);
        if (!checkInValidStringField(description)) return sendResponse(res, 400, "Description is a required field", null);
        if (!checkInValidStringField(email) && checkInValidEmail(email)) return sendResponse(res, 400, "Email is a invalid field", null);
        if (!checkInValidStringField(number) && number.trim().length != 10) return sendResponse(res, 400, "Number is a required field and should be of length 10", null);
        if (!checkValidMongoseId(serviceId)) return sendResponse(res, 400, "Service ID is a required field", null);
        if (!checkValidMongoseId(subServiceId)) return sendResponse(res, 400, "Sub Service ID is a required field", null);
        if (!amount) return sendResponse(res, 400, "Invalid amount", null);

        const service = await serviceModel.findById(serviceId);
        let isFound = false;

        service?.services.forEach(element => {
            console.log("element is",element)
            if (element._id == subServiceId) {
                console.log("selected element is",element)
                isFound = true;
                if (amount != element.price) {
                    return sendResponse(res, 400, "Amount is mismatch", null)
                }
                
            }
        });

        if (!isFound) {
            return sendResponse(res, 400, "Sub service id not found", null)
        }

        const newRequest = new ServiceRequest({
            name,
            email,
            description,   
            number,
            customer,
            serviceId,
            address,
            subServiceId,
            amount
        });

        const savedRequest = await newRequest.save();
        return sendResponse(res, 201, "Service request created successfully", savedRequest);
    } catch (error) {
        logger.error("error at creating request is", error)
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

// Update Request
export const updateServiceRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid service request ID", null);
        }

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedRequest) {
            return sendResponse(res, 404, "Service request not found", null);
        }

        return sendResponse(res, 200, "Service request updated successfully", updatedRequest);
    } catch (error) {
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

// View All Requests
export const getAllServiceRequests = async (req: Request, res: Response) => {
    try {
        const requests = await ServiceRequest.find().populate("customer serviceId subServiceId assignTo");
        return sendResponse(res, 200, "Service requests fetched successfully", requests);
    } catch (error) {
        return sendResponse(res, 500, "Something went wrong", error);
    }
};


export const getAllServiceRequestsByUser = async (req: Request, res: Response) => {
    try {
        // // const id = req.user ;
        // const requests = await ServiceRequest.find({ customer: id }).populate("customer serviceId assignTo");
        // return sendResponse(res, 200, "Service requests fetched successfully", requests);
    } catch (error) {
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

// View Request by ID
export const getServiceRequestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid service request ID", null);
        }

        const request = await ServiceRequest.findById(id).populate("customer serviceId assignTo");

        if (!request) {
            return sendResponse(res, 404, "Service request not found", null);
        }

        return sendResponse(res, 200, "Service request fetched successfully", request);
    } catch (error) {
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

// Change Status
export const changeServiceRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid service request ID", null);
        }

        if (!status || !Object.values(ServiceRequestEnum).includes(status)) {
            return sendResponse(res, 400, "Invalid or missing status", null);
        }

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedRequest) {
            return sendResponse(res, 404, "Service request not found", null);
        }

        return sendResponse(res, 200, "Service request status updated successfully", updatedRequest);
    } catch (error) {
        return sendResponse(res, 500, "Something went wrong", error);
    }
};
