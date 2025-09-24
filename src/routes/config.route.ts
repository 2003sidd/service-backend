import express from "express"
import { getConfig, updateConfig } from "../controller/config.controller";

const configRouter = express.Router();

configRouter.get('/config', getConfig);
configRouter.post('/upsertConfig', updateConfig);

export default configRouter;