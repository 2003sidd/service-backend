import configModel from "../model/config.model";
import { Request, Response } from "express";
import { sendResponse } from "../utility/UtilityFunction";

const getConfig = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return res.status(404).json({ message: 'Config not found' });
        sendResponse(res, 200, "Config found", config)
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

const updateConfig = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: data },
            { upsert: true, new: true } // create if not exists
        );

        res.json(config);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export { updateConfig, getConfig }