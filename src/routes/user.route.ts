import express from "express"
import { addUser, changePassword, getUser, getUsers, login, logout, toggleStatus, UpdateUser, UpsertUserByAdmin } from "../controller/user.controller";
import { authorize } from "../middleware/jwt";
const userRouter = express.Router();

userRouter.post("/users",authorize(), getUsers);
userRouter.get("/user/:id",authorize(), getUser);
userRouter.get("/toggleCustomerStatus/:id", toggleStatus);
userRouter.post("/changePassword",authorize(), changePassword);
userRouter.post("/login", login);
userRouter.post("/upsertUserByAdmin",authorize(), UpsertUserByAdmin);    
userRouter.post("/updateUser",authorize(), UpdateUser);    
userRouter.post("/register", addUser);    
userRouter.post("/logout",authorize(), logout);

export default userRouter