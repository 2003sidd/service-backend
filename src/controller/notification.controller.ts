import { Request, Response } from "express";
import NotificationModel from "../model/notification.model";
import logger from "../utility/wingstonLogger";
import { checkValidMongoseId, sendResponse } from "../utility/UtilityFunction";


export const getAllNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const { index = 1, top = 10, searchBy = "" } = req?.body;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Id Provided is invalid", null)
        }

        const count = await NotificationModel.countDocuments({ user: id })


        const data = await NotificationModel.find({ user: id })
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        if (!data.length)
            return sendResponse(res, 200, "No data found", null);


        return sendResponse(res, 200, "Data found", { data, count });


    } catch (err: any) {
        logger.error("Error at getting notification", null)
        sendResponse(res, 500, err.message, null);
    }
}

export const getAllTechnicianNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const { index = 1, top = 10, searchBy = "" } = req?.body;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Id Provided is invalid", null)
        }

        const count = await NotificationModel.countDocuments({ employee: id })

        const data = await NotificationModel.find({ employee: id })
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });


        if (data && data.length==0)
            return sendResponse(res, 200, "No data found", null);

        return sendResponse(res, 200, "Data found", { data, count });


    } catch (err: any) {
        logger.error("Error at getting employee notification", null)
        sendResponse(res, 500, err.message, null);
    }
}




export const markAsSeen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Id Provided is invalid", null)
        }

        const data = await NotificationModel.findById(id);
        if (!data) {
            return sendResponse(res, 400, "No Notification found   ", null)
        }

        data.isSeen = true;
        await data.save();

        return sendResponse(res, 200, "Notification seen", data);


    } catch (err: any) {
        logger.error("Error at marking seen in notification", null)
        sendResponse(res, 500, err.message, null);
    }
}
