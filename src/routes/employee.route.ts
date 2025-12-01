import express from "express"
import { editEmployee, getEmployee, getTechnician, loginEmployee, logoutEmployee, registerEmployee, toggleStatus } from "../controller/employee.controller";
import { authorize } from "../middleware/jwt";
const employeeRouter = express.Router();

employeeRouter.post("/registerEmployee", registerEmployee);
employeeRouter.get("/toggleStatus/:id", authorize(), toggleStatus);
employeeRouter.get("/getTechnician",authorize(), getTechnician);
employeeRouter.post("/loginEmployee", loginEmployee);
employeeRouter.post("/getEmployee",authorize(), getEmployee);
employeeRouter.post("/logoutEmployee",authorize(), logoutEmployee)
employeeRouter.post("/editEmployee/:id",authorize(), editEmployee);

export default employeeRouter
