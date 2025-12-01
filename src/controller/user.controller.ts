// controllers/userController.js
import UserModel from "../model/user.model";
import { Request, Response } from "express";
import { checkInValidEmail, checkInValidStringField, checkValidMongoseId, generateToken, sendResponse } from "../utility/UtilityFunction";
import logger from "../utility/wingstonLogger";
import { roleEnum } from "../enum/role.enum";
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

            const user = await UserModel.findById(_id);
            if (!user) {
                return sendResponse(res, 404, "User not found", false);
            }

            // Update fields
            user.name = name;
            user.email = email;
            user.number = number;
            if (password) {
                user.password = password; // This will trigger `pre('save')` to hash it
            }

            await user.save();

            return sendResponse(res, 200, "User updated", true);

        }

    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", false);
    }
};

export const UpdateUser = async (req: Request, res: Response) => {
    try {
        const { id, name, number } = req.body;

        if (!checkInValidStringField(name)) {
            return sendResponse(res, 400, "Name is required field", null);
        }

        if (!checkInValidStringField(number) && number.length != 10) {
            return sendResponse(res, 400, "Phone number is invalid", null);
        }

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Invalid user id", null);
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return sendResponse(res, 404, "User not found", null);
        }

        // Update fields
        user.name = name;
        user.number = number;

        await user.save();

        return sendResponse(res, 200, "User updated", user);

    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, err.message, null);
    }
};

export const addUser = async (req: Request, res: Response) => {
    try {
        const { name, email, fcmToken, number, password } = req.body;

        if (!checkInValidStringField(name)) {
            return sendResponse(res, 400, "Name is required field", null);
        }

        if (!checkInValidStringField(fcmToken)) {
            return sendResponse(res, 400, "fcm token is required field", null);
        }

        if (!checkInValidStringField(email) && checkInValidEmail(email)) {
            return sendResponse(res, 400, "Email is required field and should be valid", null);
        }

        if (!checkInValidStringField(number) && number.length != 10) {
            return sendResponse(res, 400, "Phone number is invalid", null);
        }

        if (!checkInValidStringField(password) && password.length < 8) {
            return sendResponse(res, 400, "Password is required field and have minimum 8 length", null);
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return sendResponse(res, 400, "User already exists with given email", null);
        }



        const user = new UserModel({
            name,
            email,
            password,
            number,
            fcmToken: [fcmToken]   // save as array
        });

        await user.save();

        // user will never be null here; remove if(!user)
        let obj = {
            id: user._id.toString(),
            name: user.name,
            number: user.number,
            email: user.email,
            role: roleEnum.CUSTOMER
        };

        const jwt = generateToken(obj);

        delete (user as any).password;

        return sendResponse(res, 200, "User created", { user, jwt });

    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", null);
    }
}
// Login Controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, fcmToken } = req.body;


        if (!checkInValidStringField(email) && checkInValidEmail(email)) {
            return sendResponse(res, 400, "Email is required field and should be valid", null);
        }

        if (!checkInValidStringField(password) && password.length < 8) {
            return sendResponse(res, 400, "Password is required field and have minimum 8 length", null);
        }

        if (!checkInValidStringField(fcmToken)) {
            return sendResponse(res, 400, "FCM token is required field", null);
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return sendResponse(res, 400, "User not found", null);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendResponse(res, 200, "Invalid credentials", null);
        }

        if (!user.isActive) {
            return sendResponse(res, 400, "Your account is deactive contact admin", null)

        }

        user.fcmToken.push(fcmToken);
        await user.save();

        let obj = {
            id: user._id.toString(),
            name: user.name,
            number: user.number, email: user.email, role: roleEnum.CUSTOMER
        }
        const jwt = generateToken(obj)

        delete (user as any).password;

        sendResponse(res, 200, "Login successful", { user: user, jwt });
    } catch (err: any) {
        logger.error("error", err)
        sendResponse(res, 500, "Internal Server Error", null);
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { fcmToken } = req.body;
        const { id } = req.user;

        if (!checkInValidStringField(fcmToken)) {
            return sendResponse(res, 400, "Invalid FCM token", false);
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return sendResponse(res, 404, "User not found", false);
        }

        user.fcmToken = user.fcmToken.filter((token) => token !== fcmToken);

        await user.save();

        return sendResponse(res, 200, "User logged out successfully", true);
    } catch (error) {
        logger.error("Logout error:", error);
        return sendResponse(res, 500, "Internal Server Error", false);
    }
};


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fcmToken, name, email, number, password } = req.body;

        if (!checkInValidStringField(name)) {
            return sendResponse(res, 400, "Name is required field", null);
        }

        if (!checkInValidStringField(fcmToken)) {
            return sendResponse(res, 400, "FCM token is required field", null);
        }


        if (!checkInValidStringField(email) && checkInValidEmail(email)) {
            return sendResponse(res, 400, "Email is required field and should be valid", null);
        }

        if (!checkInValidStringField(number) && number.length != 10) {
            return sendResponse(res, 400, "Phone number is invalid", null);
        }

        if (!checkInValidStringField(password) && password.length < 8) {
            return sendResponse(res, 400, "Password is required field and have minimum 8 length", null);
        }



        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, "User exist with provided email", null);
        }

        const user = new UserModel({ name, email, number, password, fcmToken });
        await user.save();

        let obj = {
            id: user._id.toString(),
            name: user.name,
            number: user.number, email: user.email, role: roleEnum.CUSTOMER
        }
        const jwt = generateToken(obj)

        sendResponse(res, 201, "User registered successfully", { jwt });

    } catch (error) {
        logger.error("error at registering user is", error)
        sendResponse(res, 500, "Internal Server Error", null);

    }
}


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

        // if (searchBy.trim() !== "") {
        //     // Case-insensitive regex search on name or email
        //     query.$or = [
        //         { name: { $regex: searchBy, $options: "i" } },
        //         { number: { $regex: searchBy, $options: "i" } },
        //     ];
        // };

        // query.isActive = true;

        // Count total matching users
        const total = await UserModel.countDocuments(query);

        // Fetch paginated data
        const users = await UserModel.find(query, { password: 0, fcmToken: 0 })
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        sendResponse(res, 200, "Users fetched successfully", { users, total });
    } catch (error: any) {
        logger.error("Get Users Error:", error);
        sendResponse(res, 500, "Internal Server Error", error.message);
    }

}

export const getUser = async (req: Request, res: Response) => {
    try {

        const {id} = req.params;

        if(!checkValidMongoseId(id)){
            return sendResponse(res,400,"User id is invalid ", null)
        }
        // Fetch data
        const user = await UserModel.findById(id).select('-password -fcmToken')

        if(!user) return sendResponse(res,400, "User not found",null)

        if(!user.isActive){
            return sendResponse(res,200,"User Account has been Delete",null)
        }
        
        sendResponse(res, 200, "Users fetched successfully", user);
    } catch (error: any) {
        logger.error("Get Users Error:", error);
        sendResponse(res, 500, error.message, null);
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

        user.isActive = ! user.isActive;

        await user.save();

        return sendResponse(res, 200, "User status updated", true)
    } catch (error: any) {
        logger.error("error", error)
        sendResponse(res, 500, error.message, false);
    }
}