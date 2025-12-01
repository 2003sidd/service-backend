import mongoose, { NullExpression } from "mongoose";
import { ServiceRequestEnum } from "../enum/serviceRequest.enum";

// Define the ServiceRequest interface (representing a service request)
export interface IServiceRequest extends Document {
    name: string;                  // Customer's name
    email: string;                 // Customer's email
    number: string;
    uuid:string;
    customer: mongoose.Schema.Types.ObjectId;
    address: string;
    subServiceName: string; // Array of requested services
    serviceId: mongoose.Schema.Types.ObjectId; // Array of requested services
    status: ServiceRequestEnum; // Service request status
    createdAt: Date;                       // Timestamp of creation
    csrPath: string
    description:string
    assignTo: mongoose.Schema.Types.ObjectId;
    assignmentRequest: mongoose.Schema.Types.ObjectId|NullExpression;
    comment: string,
    amount: string
}