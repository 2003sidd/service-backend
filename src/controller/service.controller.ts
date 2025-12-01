import { Request, Response } from "express";
import serviceModel from "../model/service.model";
import { checkInValidNumberField, checkInValidStringField, checkValidMongoseId, sendResponse } from "../utility/UtilityFunction";
import logger from "../utility/wingstonLogger";

const upsertService = async (req: Request, res: Response) => {
    try {

        const { _id, name, description, services, isActive = true } = req.body;

      

        if (!checkInValidStringField(name)) {
            return sendResponse(res, 400, "Name is required field", false);
        }

        if (!checkInValidStringField(description)) {
            return sendResponse(res, 400, "Title is required field", false);
        }

        if (services == undefined && Array.isArray(services) && services.length < 1) {
            return sendResponse(res, 400, "Services must not be empty", false);
        }

      

        for (let i = 0; i < services.length; i++) {
            if (!checkInValidStringField(services[i].price) || !checkInValidStringField(services[i].name)) {
                return sendResponse(res, 400, "Service data is invalid", false)
            }
        }

        if (!_id) {
            await serviceModel.create({ name, description, services, isActive });
            return sendResponse(res, 201, "Service created successfully", true);
        }

        const data = await serviceModel.findByIdAndUpdate(
            _id,
            { $set: { name, description, services, isActive } },
            { new: true }
        );

        if (!data)
            return sendResponse(res, 500, "Service not created", false);

        return sendResponse(res, 200, "Service updated succesfully", true)


    } catch (error: any) {
        logger.error("Error at upsert service is", error)
        sendResponse(res, 500, error.message, false);
    }
};

const getAllServices = async (req: Request, res: Response) => {
    try {
        const data = await serviceModel.find({ isActive: true });
        if (data && data.length > 0) {
            return sendResponse(res, 200, "Service found", data);
        }

        return sendResponse(res, 200, "Service Not Found", null);
    } catch (error: any) {

        logger.error("Error at toogle status of employee", error)
        sendResponse(res, 500, "Status toggle failed", error.message);
    }
};

const getAllServicesAdmin = async (req: Request, res: Response) => {
    try {
        const data = await serviceModel.find();
        if (data && data.length > 0) {
            return sendResponse(res, 200, "Service found", data);
        }

        return sendResponse(res, 200, "Service Not Found", null);
    } catch (error: any) {

        logger.error("Error at getting all service", null)
        sendResponse(res, 500, "Internal server error", null);
    }
};

const toggleServiceStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Id is invalid", false);
        }

        const data = await serviceModel.findById(id);
        if (!data)
            return sendResponse(res, 200, "Data not found", false);

        data.isActive = !data.isActive;
        await data.save();

        return sendResponse(res, 200, "Status toggled successfully", true)
    } catch (error) {

        logger.error("Error at getting all service", false)
        sendResponse(res, 500, "Internal server error", false)
    }
}

const getServiceById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", null)
        }

        const data = await serviceModel.findById(id);

        if (!data)
            return sendResponse(res, 200, "Service not found", null);


        return sendResponse(res, 200, "Service found", data);
    } catch (error: any) {

        logger.error("Error at toogle isActive of employee", error)
        sendResponse(res, 500, "Status toggle failed", error.message);
    }
};



export { getAllServices, getAllServicesAdmin, toggleServiceStatus, getServiceById, upsertService };

