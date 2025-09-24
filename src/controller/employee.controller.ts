import { Request, Response } from "express";
import EmployeeModel from "../model/employee.model";
import { checkInValidEmail, checkInValidStringField, generateToken, sendResponse } from "../utility/UtilityFunction";
import logger from "../utility/wingstonLogger";
import { roleEnum } from "../enum/role.enum";


// 🔹 Register (Add Employee)
export const registerEmployee = async (req: Request, res: Response) => {
  try {
    const { _id, name, email, address, number, password, role } = req.body;


    if (!checkInValidStringField(name)) {
      return sendResponse(res, 400, "Name is required field", false);
    }

    if (!checkInValidStringField(address) && (address.length < 8 || address.length > 80)) {
      return sendResponse(res, 400, "Address is required field and should be greater than equals to 80 and less than equals to 80", false);
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

    const allowedRoles = Object.values(roleEnum);

    let isValidRole = allowedRoles.includes(role);
    if (!isValidRole) {
      return sendResponse(res, 400, "Role is invalid", false)
    }

    if (!_id) {

      const exists = await EmployeeModel.findOne({ email });
      if (exists) return sendResponse(res, 400, "Email already exists", false);

      const employee = new EmployeeModel({ name, email, number, address, password, role });
      await employee.save();

      return sendResponse(res, 201, "Employee registered", true);
    }


    const data = await EmployeeModel.findByIdAndUpdate(_id, { $set: { name, email, number, role } }, { new: true })

    if (!data)
      return sendResponse(res, 500, "Employee not update", false);

    return sendResponse(res, 200, "Employee updated successfully", true);
  } catch (err: any) {
    logger.error("Error at register employee", err)
    sendResponse(res, 500, "Failed to register", err);
  }
};

// 🔹 Login
export const loginEmployee = async (req: Request, res: Response) => {
  try {
    const { email, password, type, fcmToken } = req.body;

    // const allowedRoles = Object.values(roleEnum);

    // let isValidRole = allowedRoles.includes(role);
    // if (!isValidRole) {
    //   sendResponse(res, 400, "Role is invalid", null)
    // }

    if (!checkInValidStringField(email) && checkInValidEmail(email)) {
      return sendResponse(res, 400, "Email is required field and should be valid", null);
    }

    if (!checkInValidStringField(password) && password.length < 8) {
      return sendResponse(res, 400, "Password is required field and have minimum 8 length", null);
    }


    const employee = await EmployeeModel.findOne({ email });
    if (!employee) return sendResponse(res, 400, "Employee not found", null);

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return sendResponse(res, 401, "Invalid credentials", null);

    if (!employee.isActive) return sendResponse(res, 403, "Account is inactive", null);

    if (type && type == 0) {
      if (employee.role == "Technician") {
        return sendResponse(res, 400, "No admin or super admin found", null)
      }
    }



    if (fcmToken) {
      employee.fcmToken.push(fcmToken);
      return await employee.save();
    }

    delete (employee as any).password;
    employee.toObject();
    let obj = {
      name: employee.name,
      number: employee.number, role: employee.role, email: employee.email
    }
    const jwt = generateToken(obj)
    sendResponse(res, 200, "Login successful", {
      employee, jwt
    });
  } catch (err: any) {
    logger.error("Error at login employee", err)
    sendResponse(res, 500, "Login failed", err);
  }
};

// 🔹 Edit Employee
export const editEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, number, role } = req.body;


    if (!checkInValidStringField(name)) {
      return sendResponse(res, 400, "Name is required field", null);
    }

    if (!checkInValidStringField(email) && checkInValidEmail(email)) {
      return sendResponse(res, 400, "Email is required field and should be valid", null);
    }

    if (!checkInValidStringField(number) && number.length != 10) {
      return sendResponse(res, 400, "Phone number is invalid", null);
    }

    const allowedRoles = Object.values(roleEnum);

    let isValidRole = allowedRoles.includes(role);
    if (!isValidRole) {
      sendResponse(res, 400, "Role is invalid", null)
    }

    const updated = await EmployeeModel.findByIdAndUpdate(
      id,
      { name, email, number, role },
      { new: true }
    );

    if (!updated) return sendResponse(res, 404, "Employee not found", null);

    sendResponse(res, 200, "Employee updated", updated);
  } catch (err: any) {
    logger.error("Error at edit employee", err)
    sendResponse(res, 500, "Update failed", err.message);
  }
};

// 🔹 Toggle Status
export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await EmployeeModel.findById(id);
    if (!employee) return sendResponse(res, 404, "Employee not found", null);

    employee.isActive = !employee.isActive;
    await employee.save();

    sendResponse(res, 200, "Status toggled", {
      id: employee._id,
      isActive: employee.isActive,
    });
  } catch (err: any) {
    logger.error("Error at toogle status of employee", null)
    sendResponse(res, 500, "Status toggle failed", null);
  }
};

// paginated get all emoloyee with search 
export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { index = 1, top = 10, searchBy = "", filterByRole = "" } = req.body;

    const query: any = {};

    if (filterByRole.trim() !== "") {
      const allowedRoles = Object.values(roleEnum);

      let isValidRole = allowedRoles.includes(filterByRole);
      if (!isValidRole) {
        sendResponse(res, 400, "Role is invalid", null)
      }
      query.role = filterByRole
    }

    if (searchBy.trim() !== "") {
      // Case-insensitive regex search on name or email
      query.$or = [
        { name: { $regex: searchBy, $options: "i" } },
        { number: { $regex: searchBy, $options: "i" } },
      ];
    }

    // query.role = roleEnum.TECHNICIAN;

    // Count total matching users
    const total = await EmployeeModel.countDocuments(query);

    // Fetch paginated data
    const users = await EmployeeModel.find(query)
      .skip((index - 1) * top)
      .limit(top)
      .sort({ createdAt: -1 });

    sendResponse(res, 200, "Technican fetched successfully", { users, total });
  } catch (error) {

  }
}
