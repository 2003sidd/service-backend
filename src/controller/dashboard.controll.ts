import { Request, Response } from "express";
import logger from "../utility/wingstonLogger";
import { sendResponse } from "../utility/UtilityFunction";
import UserModel from "../model/user.model";
import EmployeeModel from "../model/employee.model";
import serviceModel from "../model/service.model";

const getDashBoardData = async (req: Request, res: Response) => {
    try {
        const user = await UserModel.find().limit(5);
        const userCount = await UserModel.countDocuments();
        const serviceCount = await serviceModel.countDocuments();

        const employeeCount = await EmployeeModel.countDocuments();

        sendResponse(res, 200, "Dashboard data", { user, userCount, employeeCount, serviceCount })
    } catch (error) {
        logger.error("Error at getting dashboard data"+ error);
        sendResponse(res, 500, "Internal server error", null)
    }
};
export default getDashBoardData