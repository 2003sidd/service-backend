import mongoose from "mongoose";

interface IServiceDetails {
    name: string;
    price: number;
}

// Define the RequestedService interface (representing a single requested service)
interface IRequestedService {
    serviceId: mongoose.Schema.Types.ObjectId;  // Reference to Service collection
    serviceDetails: IServiceDetails;            // Service details (name and price)
    quantity: number;                           // Quantity of the service requested
}

// Define the ServiceRequest interface (representing a service request)
export interface IServiceRequest extends Document {
    customerName: string;                  // Customer's name
    customerEmail: string;                 // Customer's email
    customerNumber: string;
    customerId: mongoose.Schema.Types.ObjectId;
    requestedServices: IRequestedService[]; // Array of requested services
    status: 'pending' | 'in-progress' | 'completed'; // Service request status
    createdAt: Date;                       // Timestamp of creation
    csrPath: string
    assignTo: mongoose.Schema.Types.ObjectId;
    comment:string,
    price:string[]
}
