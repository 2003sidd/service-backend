import mongoose, { Types } from "mongoose"
import ApiResponse from "./ApIResponse"
import { Response } from "express"
import ApiError from "./ApiError"
import jwt from "jsonwebtoken"
import { roleEnum } from "../enum/role.enum"


const sendResponse = (res: Response, statusCode: number, message: string = "DataFound", data: any) => {
    return res.status(statusCode).json(
        new ApiResponse(statusCode, data, message)
    );
}

const throwError = (res: Response, statusCode: number, errorMessage = "Internal server error", data = null) => {
    return res.status(statusCode).json(
        new ApiError(statusCode, errorMessage, data)
    );
};

const checkInValidStringField = (data: string | null | undefined): boolean => {
    if (typeof data !== 'string' || data.trim() === "") {
        return false;
    }
    return true;
};


const checkInValidNumberField = (data: any): boolean => {
    return typeof data === "number" && !isNaN(data) && data > 0;
};


const checkValidMongoseId = (_id: Types.ObjectId | string) => {
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        return false;
    }
    return true;
}

const checkInValidEmail = (email: string) => {
    // Regular expression to test standard email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Return true if the email is invalid (i.e., doesn't match the regex)
    return !emailRegex.test(email);
};

const generateToken = (userData: { id:string, name: string, number: string, email: string, role: roleEnum }) => {
    // Generate a new JWT token using user data

    if (userData.role === roleEnum.ADMIN || userData.role === roleEnum.SUPERADMIN) {
        return jwt.sign(userData, "Service@2026/12/09", { expiresIn: '30d' });
    }
    return jwt.sign(userData, "Service@2026/12/09", { expiresIn: '30d' });
}

export function generateServiceId(serviceId: string): string {
    // Convert timestamp to base36 (numbers + letters)
 const shortTime = Date.now().toString(36).toUpperCase().slice(-6);
  
  // Take only first 2–3 chars of the provided serviceId
  const shortService = serviceId.slice(0, 3).toUpperCase();
  
  return `#SOS-${shortTime}${shortService}`;
}


const checkInValidPhoneNum = (phoneNum: string): boolean => {
    const phoneRegex = /^[+]?[1-9][0-9]{1,14}$/;
    return phoneRegex.test(phoneNum);
}


export { sendResponse, generateToken, throwError, checkInValidPhoneNum, checkInValidNumberField, checkValidMongoseId, checkInValidStringField, checkInValidEmail };