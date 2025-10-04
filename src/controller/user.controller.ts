// controllers/userController.js
import UserModel from "../model/user.model";
import { Request, Response } from "express";
import { checkInValidEmail, checkInValidStringField, checkValidMongoseId, generateToken, sendResponse } from "../utility/UtilityFunction";
import logger from "../utility/wingstonLogger";
// controllers/userController.ts

// Register Controller
export const UpsertUserByAdmin = async (req: Request, res: Response) => {
    try {
        const { _id, name, email, number, password } = req.body;

        if (!checkInValidStringField(name)) {
            return sendResponse(res, 400, "Name is required field", false);
        }

        if (!checkInValidStringField(email) && checkInValidEmail(email)) {
            return sendResponse(res, 400, "Email is required field and should be valid", false);
        }

        if (!checkInValidStringField(number) && number.length != 10) {
            return sendResponse(res, 400, "Phone number is invalid", false);
        }

        if (!checkInValidStringField(password) && password.length < 8) {
            return sendResponse(res, 400, "Password is required field and have minimum 8 length", false);
        }

        if (!_id) {

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return sendResponse(res, 400, "User exist with provided email", false);
            }

            const user = new UserModel({ name, email, number, password });
            await user.save();

            sendResponse(res, 201, "User registered successfully", true);
        } else {
            const data = await UserModel.findByIdAndUpdate(_id, { $set: { name, email, number, password } }, { new: true });


            if (!data)
                return sendResponse(res, 500, "Employee not updated", false);

            return sendResponse(res, 200, "Employee updated", true);

        }

    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", false);
    }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!checkInValidStringField(email) && checkInValidEmail(email)) {
            return sendResponse(res, 400, "Email is required field and should be valid", null);
        }

        if (!checkInValidStringField(password) && password.length < 8) {
            return sendResponse(res, 400, "Password is required field and have minimum 8 length", null);
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return sendResponse(res, 404, "User not found", null);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendResponse(res, 401, "Invalid credentials", null);
        }
         let obj = {
              name: user.name,
              number: user.number, email: user.email
            }
            const jwt = generateToken(obj)

        sendResponse(res, 200, "Login successful", { user: user,jwt });
    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", null);
    }
};

// Change Password Controller
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return sendResponse(res, 404, "User not found", false);
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return sendResponse(res, 401, "Old password is incorrect", false);
        }

        user.password = newPassword;
        await user.save();

        sendResponse(res, 200, "Password changed successfully", true);
    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", false);

    }
};


export const getUsers = async (req: Request, res: Response) => {
    try {
        const { index = 1, top = 10, searchBy = "" } = req.body;

        const query: any = {};

        if (searchBy.trim() !== "") {
            // Case-insensitive regex search on name or email
            query.$or = [
                { name: { $regex: searchBy, $options: "i" } },
                { number: { $regex: searchBy, $options: "i" } },
            ];
        };

        // query.isActive = true;

        // Count total matching users
        const total = await UserModel.countDocuments(query);

        // Fetch paginated data
        const users = await UserModel.find(query)
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        sendResponse(res, 200, "Users fetched successfully", { users, total });
    } catch (error: any) {
        logger.error("Get Users Error:", error);
        sendResponse(res, 500, "Internal Server Error", error.message);
    }

}

export const toggleStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const userId = req.params.id;

        if (!checkValidMongoseId(userId)) {
            return sendResponse(res, 400, "User id is invalid or undefined", false);
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return sendResponse(res, 404, "User not found", false);
        }

        user.isActive = false;

        await user.save();

        return sendResponse(res, 200, "User status updated", true)
    } catch (error: any) {
        logger.error("error", error)
        sendResponse(res, 500, error.message, false);
    }
}