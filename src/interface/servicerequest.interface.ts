import mongoose from "mongoose";
import { ServiceRequestEnum } from "../enum/serviceRequest.enum";

// Define the ServiceRequest interface (representing a service request)
export interface IServiceRequest extends Document {
    name: string;                  // Customer's name
    email: string;                 // Customer's email
    number: string;
    customer: mongoose.Schema.Types.ObjectId;
    address: string;
    subServiceId: mongoose.Schema.Types.ObjectId; // Array of requested services
    serviceId: mongoose.Schema.Types.ObjectId; // Array of requested services
    status: ServiceRequestEnum; // Service request status
    createdAt: Date;                       // Timestamp of creation
    csrPath: string
    assignTo: mongoose.Schema.Types.ObjectId;
    comment: string,
    amount: string
}