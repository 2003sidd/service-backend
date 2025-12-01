import mongoose from "mongoose";

export interface INotification {
    isSeen : Boolean, 
    title:String, 
    descripation:String,
    user: mongoose.Schema.Types.ObjectId;
    employee: mongoose.Schema.Types.ObjectId;
}

