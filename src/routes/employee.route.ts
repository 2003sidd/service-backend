import express from "express"
import { editEmployee, getEmployee, loginEmployee, registerEmployee, toggleStatus } from "../controller/employee.controller";
const employeeRouter = express.Router();

employeeRouter.post("/registerEmployee", registerEmployee);
employeeRouter.get("/toggleStatus/:id", toggleStatus);
employeeRouter.post("/loginEmployee", loginEmployee);
employeeRouter.post("/getEmployee", getEmployee);
employeeRouter.post("/editEmployee/:id", editEmployee);

export default employeeRouter