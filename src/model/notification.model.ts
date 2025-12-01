import mongoose from "mongoose";
import { INotification } from "../interface/notification.interface";
import { title } from "process";
import { time } from "console";

const NotificationSchmea = new mongoose.Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    descripation: {
        type: String,
        required: true
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref:"User"
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref:"Employee"
    }

}, { timestamps: true });

const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchmea);

export default NotificationModel