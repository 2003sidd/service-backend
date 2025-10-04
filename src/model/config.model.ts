import { Config } from "../interface/config.interface";
import mongoose, { Schema } from "mongoose";

const ConfigSchema: Schema<Config> = new Schema({
    _id: {
        type: String,
        default: 'singleton'
    },
    CustomerAppVersion: {
        type: String,
        default: '0.0.0'
    },
    TechnicianAppVersion: {
        type: String,
        default: '0.0.0'
    },
    isMaintaince: {
        type: Boolean,
        default: false
    },
    aboutUs: {
        type: String,
        default: ''
    },
    contactNumber: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    privacyPolicy: {
        type: String,
        default: ''
    },
    termAndConditon: {
        type: String,
        default: ''
    }
});

export default mongoose.model("Config", ConfigSchema)
