import { Request, Response } from "express";
import logger from "../utility/wingstonLogger";
import { sendResponse } from "../utility/UtilityFunction";
import UserModel from "../model/user.model";
import EmployeeModel from "../model/employee.model";
import serviceModel from "../model/service.model";
import { roleEnum } from "../enum/role.enum";
import ServiceRequest from "../model/serviceRequest.model";

const getDashBoardData = async (req: Request, res: Response) => {
    try {
        const user = await UserModel.find().select("name email number").limit(5);
        const userCount = await UserModel.countDocuments();
        const serviceCount = await serviceModel.countDocuments();
        const serviceRequestCount = await ServiceRequest.countDocuments();
        const serviceRequest = await ServiceRequest.find().populate("serviceId").limit(5);


        const employeeCount = await EmployeeModel.countDocuments({ role: roleEnum.TECHNICIAN });

        sendResponse(res, 200, "Dashboard data", { user, userCount, employeeCount, serviceCount, serviceRequest, serviceRequestCount })
    } catch (error) {
        logger.error("Error at getting dashboard data" + error);
        sendResponse(res, 500, "Internal server error", null)
    }
};
export default getDashBoardData