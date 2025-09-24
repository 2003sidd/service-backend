import mongoose, { Schema } from "mongoose";
import { IServiceRequest } from "../interface/servicerequest.interface";

// Define the ServiceRequest schema (same as before)
const serviceRequestSchema = new Schema<IServiceRequest>({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerNumber: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedServices: [
        {
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // Reference to service
            serviceDetails: {
                name: { type: String, required: true },
                price: { type: Number, required: true },
            },
            quantity: { type: Number, default: 1 },
        },
    ],
    csrPath: { type: String, required: false },
    assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    comment: { type: String, required: false },
    price: { type: [String], required: false },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

// Define the ServiceRequest model
const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;