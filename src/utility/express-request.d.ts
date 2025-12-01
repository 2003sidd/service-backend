// custom.d.ts
import { User } from './models/user'; // replace with your actual User type

declare global {
  namespace Express {
    interface Request {
      user: User;  // assuming user is of type User, replace it with the actual type you are using
    }
  }
}

