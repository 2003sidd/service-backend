import { roleEnum } from "../enum/role.enum";

export interface IEmployee {
    name: string;
    email: string;
    number: string;
    role: roleEnum
    password: string;
    isActive: boolean;
    address: string;
    notificationCount:string,
    pinCode: string[];
    fcmToken: string[]
}

// 2. Extend Document with the method comparePassword
export interface IEmployeeDocument extends IEmployee, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}