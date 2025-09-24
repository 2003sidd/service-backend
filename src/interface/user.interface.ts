export interface IUser {
  name: string;
  email: string;
  number: string;
  password: string;
  isActive: boolean;
}

// 2. Extend Document with the method comparePassword
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}