import e, { Request, Response } from "express";
import mongoose from "mongoose";
import { checkInValidEmail, checkInValidStringField, checkValidMongoseId, generateServiceId, sendResponse } from "../utility/UtilityFunction";
import ServiceRequest from "../model/serviceRequest.model";
import { ServiceRequestEnum } from "../enum/serviceRequest.enum";
import serviceModel from "../model/service.model";
import logger from "../utility/wingstonLogger";
import EmployeeModel from "../model/employee.model";
import NotificationModel from "../model/notification.model";
import { title } from "process";
import UserModel from "../model/user.model";

// Add Request
export const addServiceRequest = async (req: Request, res: Response) => {
    try {
        const { name, email, number, description, serviceId, subServiceId, amount, address } = req.body;

        const user_id = req.user.id;


        if (!checkInValidStringField(name)) return sendResponse(res, 400, "Name is a required field", false);
        if (!checkInValidStringField(address)) return sendResponse(res, 400, "Address is a required field", false);
        if (!checkInValidStringField(description)) return sendResponse(res, 400, "Description is a required field", false);
        if (!checkInValidStringField(email) && checkInValidEmail(email)) return sendResponse(res, 400, "Email is a invalid field", false);
        if (!checkInValidStringField(number) && number.trim().length != 10) return sendResponse(res, 400, "Number is a required field and should be of length 10", false);
        if (!checkValidMongoseId(serviceId)) return sendResponse(res, 400, "Service ID is a required field", false);
        if (!checkValidMongoseId(subServiceId)) return sendResponse(res, 400, "Sub Service ID is a required field", false);
        if (!amount) return sendResponse(res, 400, "Invalid amount", false);

        if (!user_id) {
            return sendResponse(res, 400, "Invalid user id", false);
        }

        const service = await serviceModel.findById(serviceId);
        let isFound = false;
        let subServiceName;
        service?.services.forEach(element => {
            if (element._id == subServiceId) {
                subServiceName = element.name
                isFound = true;
                if (amount != element.price) {
                    return sendResponse(res, 400, "Amount is mismatch", false)
                }

            }
        });

        if (!isFound) {
            return sendResponse(res, 400, "Sub service id not found", false)
        }

        let uuid = generateServiceId(serviceId)

        const newRequest = new ServiceRequest({
            name,
            email,
            description,
            number,
            uuid,
            customer: user_id,
            serviceId,
            address,
            subServiceName,
            amount
        });

        await newRequest.save();

        // find user and send notification to each of its fcm token
        const user = await UserModel.findById(user_id);
        if (user) {
            user.notificationCount = user?.notificationCount + 1;

            const notification = new NotificationModel({ title: "Service Request Created successfully", descripation: "Your service request has been successfully created. Our technician will soon visit you to resolve the issue.", user: user_id })
            await notification.save()
            await user.save()

        }

        return sendResponse(res, 201, "Service request created successfully", true);
    } catch (error: any) {
        logger.error("error at creating request is", error)
        return sendResponse(res, 500, error.message, false);
    }
};

// complete request 
export const completeServiceRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, status, comment, csrPath = "" } = req.body;

        // Validate input
        if (!amount || !status) {
            return sendResponse(res, 200, "Amount and status are required", false);

        }

        if (!Object.values(ServiceRequestEnum).includes(status)) {
            return sendResponse(res, 200, "Invalid status value", false);

        }

        // Update only allowed fields
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            id,
            {
                $set: {
                    amount,
                    status,
                    csrPath,
                    comment,
                },
            },
            { new: true }
        );

        if (!updatedRequest) {
            return sendResponse(res, 201, "Service Request not found", false);
        }


        if (status === ServiceRequestEnum.CANCELLED) {
            const user = await UserModel.findById(updatedRequest.customer);
            if (user) {
                user.notificationCount += 1;
                await user.save();

                const notification = new NotificationModel({
                    title: "Service Request Cancelled",
                    descripation: "Your service request has been cancelled. If this was a mistake or you need assistance, please contact support.",
                    user: updatedRequest.customer
                });
                await notification.save();
            }
        }

        if (status === ServiceRequestEnum.CALL_CLOSE) {
            const user = await UserModel.findById(updatedRequest.customer);
            if (user) {
                user.notificationCount += 1;
                await user.save();

                const notification = new NotificationModel({
                    title: "Service Request Completed",
                    descripation: "Your service request has been successfully completed. Thank you for using our service!",
                    user: updatedRequest.customer
                });
                await notification.save();
            }
        }

        return sendResponse(res, 200, "Service request updated successfully", true);


    } catch (error) {
        console.error("Error completing service request:", error);
        return sendResponse(res, 500, "Internal Server Error", false);

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
        logger.error("Error is", error)
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

// View All Requests
export const getAllServiceRequests = async (req: Request, res: Response) => {
    try {
        const { index = 1, top = 10, searchBy = "" } = req.body;
        const query: any = {
            status: { $ne: "NEW" },           // status is NOT "NEW"
            $or: [
                { assignmentRequest: { $exists: true, $ne: null } },
                { assignTo: { $exists: true, $ne: null } }
            ]// field exists and is not null
        };



        if (searchBy.trim() !== "") {

            query.$or = [
                { name: { $regex: searchBy, $options: "i" } },
                { number: { $regex: searchBy, $options: "i" } },
            ];
        };

        const total = await ServiceRequest.countDocuments(query);

        const data = await ServiceRequest.find(query).populate("serviceId")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, "Service requests fetched successfully", { data, total });
    } catch (error) {
        logger.error("Error is", error)
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

export const getNewServiceRequests = async (req: Request, res: Response) => {
    try {
        const { index = 1, top = 10, searchBy = "" } = req?.body;
        const query: any = {
            $and: [
                {
                    $or: [
                        { assignmentRequest: { $exists: false } },
                        { assignmentRequest: null } // shorthand for { $eq: null }
                    ]
                },
                {
                    $or: [
                        { status: ServiceRequestEnum.NEW },
                        { status: ServiceRequestEnum.PENDING }
                    ]
                }
            ]
        };


        if (searchBy.trim() !== "") {
            query.$or = [
                { uuid: { $regex: searchBy, $options: "i" } },  // Search by UUID
            ];
        }


        const total = await ServiceRequest.countDocuments(query);

        const data = await ServiceRequest.find(query).populate("serviceId")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, "Service requests fetched successfully", { data, total });
    } catch (error) {
        logger.error("Error is", error)
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

export const getServiceUser = async (req: Request, res: Response) => {
    try {
        const { index = 1, top = 10, searchBy = "" } = req?.body;
        const { id } = req.user;

        const total = await ServiceRequest.countDocuments({ customer: id });

        const data = await ServiceRequest.find({ customer: id }).populate("customer serviceId assignTo")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, "Service requests fetched successfully", { data, total });
    } catch (error) {
        logger.error("Error is", error)
        return sendResponse(res, 500, "Something went wrong", error);
    }
};

export const getAllServiceRequestsByUser = async (req: Request, res: Response) => {
    try {

        const { index = 1, top = 10, searchBy = "" } = req.body;
        const { id } = req.user;

        const query: any = {};

        if (searchBy.trim() !== "") {
            // Case-insensitive regex search on name or email
            query.$or = [
                { name: { $regex: searchBy, $options: "i" } },
                { number: { $regex: searchBy, $options: "i" } },
            ];
        };

        query.isActive = true;
        query.customer = id

        const total = await serviceModel.countDocuments(query);

        const data = await serviceModel.find(query).populate("customer serviceId assignTo")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, "Service requests fetched successfully", { total, data });
    } catch (error) {
        logger.error("error at getting request for user", error)
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

        const request = await ServiceRequest.findById(id).populate("customer serviceId assignTo assignmentRequest");

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
        const { id: employeeId } = req.user


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid service request ID", false);
        }

        if (!status || !Object.values(ServiceRequestEnum).includes(status)) {
            return sendResponse(res, 400, "Invalid or missing status", false);
        }

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(id, { status });

        if (!updatedRequest) {
            return sendResponse(res, 404, "Service request not found", false);
        }

        if (status == ServiceRequestEnum.ON_THE_WAY) {
            const user = await UserModel.findById(id);

            if (user) {
                user.notificationCount = user.notificationCount + 1;
                const notification = new NotificationModel({
                    title: "Our Technician is on the Way",
                    descripation: "Our technician is on the way and will arrive shortly to assist you with your request.",
                    user: id
                })

                await notification.save()
                await user.save()
            }
        }


        return sendResponse(res, 200, "Service request status updated successfully", true);
    } catch (error: any) {
        return sendResponse(res, 500, error.message, false);
    }
};

export const assignServiceRequest = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { _id, employeeId } = req.body;
        const { id } = req.user

        if (!checkValidMongoseId(_id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", false)
        }

        if (!checkValidMongoseId(employeeId)) {
            return sendResponse(res, 400, "Employee id is invalid or undefined", false)
        }

        const data = await ServiceRequest.findById(_id);
        if (!data)
            return sendResponse(res, 400, "Service Not Found", false)

        if (data.assignmentRequest) {
            return sendResponse(res, 400, "Already this is request to some other Technician", false)
        }

        data.assignmentRequest = employeeId;
        data.status = ServiceRequestEnum.PENDING;
        await data.save();

        const employee = await EmployeeModel.findById(id);
        if (employee) {
            employee.notificationCount = employee?.notificationCount + 1;

            const notification = new NotificationModel({
                title: "Service Request Assigned",
                descripation: "A new service request has been assigned to you. Please review it at your earliest convenience.",
                employee: employeeId
            })


            await notification.save()
            await employee.save()

        }

        sendResponse(res, 200, "Service request sent to the technician.", true);


    } catch (error: any) {

        logger.error("Error at toogle isActive of employee", error)
        sendResponse(res, 500, error.message, false);

    }
}


export const acceptRequest = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", false)
        }

        const data = await ServiceRequest.findById(id);
        if (!data)
            return sendResponse(res, 200, "Service not found", false)

        data.assignTo = user.id;
        data.status = ServiceRequestEnum.ASSIGNED;
        data.assignmentRequest = null;

        await data.save();

        const userInfo = await UserModel.findById(user.id);
        if (userInfo) {
            userInfo.notificationCount = userInfo?.notificationCount + 1;

            await userInfo.save()

            const notification = new NotificationModel({
                title: "Service Request Assigned Successfully",
                description: "Your service request has been assigned to a technician, who will visit you shortly.",
                employee: id
            })


            await notification.save()


        }


        sendResponse(res, 200, "Service request accepted", true);


    } catch (error: any) {

        logger.error("Error at accepting request", error)
        sendResponse(res, 500, error.message, false);

    }
}

export const denyRequest = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", false)
        }

        const data = await ServiceRequest.findById(id);
        if (!data)
            return sendResponse(res, 200, "Service not found", false)

        data.assignmentRequest = null;

        await data.save();

        sendResponse(res, 200, "Service request rejected", true);


    } catch (error: any) {

        logger.error("Error at rejecting request", error)
        sendResponse(res, 500, error.message, false);

    }
}

export const getRequestAssign = async (req: Request<{ id: string }>, res: Response) => {
    try {


        const { index = 1, top = 10, searchBy = "" } = req.body;
        const { id } = req.user;

        const query: any = {};

        query.assignmentRequest = id;


        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", null)
        }

        const total = await ServiceRequest.countDocuments(query);

        const data = await ServiceRequest.find(query).populate("customer serviceId assignTo")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });


        if (!data || data.length == 0) {
            return sendResponse(res, 200, "No Service Request found", null)
        }

        return sendResponse(res, 200, "Service Request found", { data, total })

    } catch (error: any) {

        logger.error("Error at accepting request", error)
        sendResponse(res, 500, error.message, null);

    }

}

export const getAssigndRequest = async (req: Request<{ id: string }>, res: Response) => {
    try {


        const { index = 1, top = 10, searchBy = "" } = req.body;
        const { id } = req.user;

        const query: any = {};

        query.assignTo = id;


        query.status = { $nin: [ServiceRequestEnum.CANCELLED, ServiceRequestEnum.CALL_CLOSE] };

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", null)
        }



        const total = await ServiceRequest.countDocuments(query);

        const data = await ServiceRequest.find(query).populate("customer serviceId assignTo")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });


        if (!data || data.length == 0) {
            return sendResponse(res, 200, "No Service Request found", null)
        }

        return sendResponse(res, 200, "Service Request found", { data, total })
    } catch (error: any) {
        logger.error("Error at accepting request", error)
        sendResponse(res, 500, error.message, null);
    }
}

export const getTechHeaderData = async (req: Request, res: Response) => {
    try {
        let { id } = req.user;

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Invalid id", null)
        }

        let pendingCount = await ServiceRequest.countDocuments({ assignmentRequest: id, status: "Pending" })
        let onGoingCount = await ServiceRequest.countDocuments({
            assignTo: id,
            $or: [
                { status: "OnSite" },
                { status: "PartsRequired" },
                { status: "Assigned" },
                { status: "OnTheWay" }
            ]
        });
        let closedCount = await ServiceRequest.countDocuments({
            assignTo: id, $or: [
                { status: "Cancelled" },
                { status: "CallClose" }
            ]
        })

        sendResponse(res, 200, "Service Count", { pendingCount, onGoingCount, closedCount })

    } catch (error: any) {
        logger.error("Error at accepting request", error)
        sendResponse(res, 500, error.message, null);
    }
}


export const getCompletedRequest = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { index = 1, top = 10, searchBy = "" } = req.body;
        const { id } = req.user;

        const query: any = {};

        query.assignTo = id;

        query.status = { $in: [ServiceRequestEnum.CANCELLED, ServiceRequestEnum.CALL_CLOSE] };

        if (!checkValidMongoseId(id)) {
            return sendResponse(res, 400, "Service id is invalid or undefined", null)
        }


        const total = await ServiceRequest.countDocuments(query);

        const data = await ServiceRequest.find(query).populate("customer serviceId assignTo")
            .skip((index - 1) * top)
            .limit(top)
            .sort({ createdAt: -1 });


        if (!data || data.length == 0) {
            return sendResponse(res, 200, "No Service Request found", null)
        }

        return sendResponse(res, 200, "Service Request found", { data, total })
    } catch (error: any) {
        logger.error("Error at accepting request", error)
        sendResponse(res, 500, error.message, null);
    }

}