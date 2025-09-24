import mongoose from "mongoose";
import { IService } from "../interface/service.interface";


const serviceSchema = new mongoose.Schema<IService>({
    name: { type: String, required: true }, // e.g., "Computer Service"
    description: { type: String, required: true }, // e.g., "Repair"
    services: [
        {
            name: { type: String, required: true }, // e.g., "Hardware Repair"
            price: { type: String, required: true }
        }
    ],
    isActive: { type: Boolean, required: false, default: true }
});


const serviceModel = mongoose.model<IService>("Service", serviceSchema);

export default serviceModel