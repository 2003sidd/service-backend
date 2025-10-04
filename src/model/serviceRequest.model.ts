import mongoose, { Schema } from "mongoose";
import { IServiceRequest } from "../interface/servicerequest.interface";
import { ServiceRequestEnum } from "../enum/serviceRequest.enum";

// Define the ServiceRequest schema (same as before)
const serviceRequestSchema = new Schema<IServiceRequest>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    subServiceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    csrPath: { type: String, required: false },
    assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    comment: { type: String, required: false },
    amount: { type: String, required: true },
    address:{ type: String, required: true },
    status: {
        type: String,
        enum: Object.values(ServiceRequestEnum),
        default: ServiceRequestEnum.NEW
    },
}, {
    timestamps: true
});

// Define the ServiceRequest model
const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;