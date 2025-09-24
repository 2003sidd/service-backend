import express from "express"
import { changePassword, getUsers, login, toggleStatus, UpsertUserByAdmin } from "../controller/user.controller";
const userRouter = express.Router();

userRouter.post("/users", getUsers);
userRouter.get("/toggleCustomerStatus/:id", toggleStatus);
userRouter.post("/changePassword", changePassword);
userRouter.post("/login", login);
userRouter.post("/upsertUserByAdmin", UpsertUserByAdmin);

export default userRouter