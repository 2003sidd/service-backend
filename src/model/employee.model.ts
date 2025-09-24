import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import { IEmployeeDocument } from "../interface/employee.interface";
import { roleEnum } from "../enum/role.enum";


//  Mongoose Schema
const EmployeeSchema: Schema<IEmployeeDocument> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        number: { type: String, required: true, unique: true },
        role: { type: String, enum: Object.values(roleEnum), required: true },
        password: { type: String, required: true },
        address:{type:String, required:true},
        isActive: { type: Boolean, default: true },
        pinCode: { type: [String], required: true },
        fcmToken: { type: [String], required: false }
    },
    { timestamps: true }
);

//  Hash password before save
EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//  Compare password method
EmployeeSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Export model
const EmployeeModel = mongoose.model<IEmployeeDocument>("Employee", EmployeeSchema);
export default EmployeeModel;