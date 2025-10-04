import configModel from "../model/config.model";
import { Request, Response } from "express";
import { sendResponse } from "../utility/UtilityFunction";
import logger from "../utility/wingstonLogger";

const getConfig = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return res.status(404).json({ message: 'Config not found' });
        sendResponse(res, 200, "Config found", config)
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

const updateTechAppVersion = async (req: Request, res: Response) => {
    try {
        const { TechnicianAppVersion } = req.body;

        if (!TechnicianAppVersion) {
            return sendResponse(res, 400, " Technician App Version us is Required", false)

        }


        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: TechnicianAppVersion },
            { upsert: true, new: true } // create if not exists
        );

        sendResponse(res, 201, "Config updated", config.TechnicianAppVersion)
    } catch (err: any) {

        logger.error("error at setting about us is", err)
        sendResponse(res, 500, "Error at Customer app version updating", false)
    }
};


const updateCustomerAppVersion = async (req: Request, res: Response) => {
    try {
        const { CustomerAppVersion } = req.body;

        if (!CustomerAppVersion) {
            return sendResponse(res, 400, " Customer App Version us is Required", false)

        }


        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: CustomerAppVersion },
            { upsert: true, new: true } // create if not exists
        );

        sendResponse(res, 201, "Config updated", config.CustomerAppVersion)
    } catch (err: any) {

        logger.error("error at setting about us is", err)
        sendResponse(res, 500, "Error at Customer app version updating", false)
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

        sendResponse(res, 201, "Config updated", config)
    } catch (err: any) {

        logger.error("error at setting about us is", err)
        sendResponse(res, 500, "Error at About us updating", false)
    }
};


const setAboutUs = async (req: Request, res: Response) => {
    try {
        const { aboutUs } = req.body;

        if (!aboutUs) {
            return sendResponse(res, 400, " About us is Required", false)

        }


        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: { aboutUs } },
            { upsert: true, new: true } // create if not exists
        );

        sendResponse(res, 201, "About us updated", true)
    } catch (err: any) {
        logger.error("error at setting about us is", err)
        sendResponse(res, 500, "Error at About us updating", false)

    }
}

export const getAboutUs = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return sendResponse(res, 201, 'Content not found', null)



        sendResponse(res, 201, 'Content found', config.aboutUs)
    } catch (err: any) {

        logger.error("error at getting about us is", err)
        sendResponse(res, 201, err.message, null)
    }
};


const setPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { privacyPolicy } = req.body;

        if (!privacyPolicy) {
            return sendResponse(res, 400, "Privacy policy content not found", null)

        }


        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: { privacyPolicy } },
            { upsert: true, new: true } // create if not exists
        );

        sendResponse(res, 201, "Privacy policy updated", config.privacyPolicy)

    } catch (err: any) {

        logger.error("error at setting about us is", err)
        sendResponse(res, 500, err.message, null)

    }
}

export const getPrivacy = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return sendResponse(res, 200, "Privacy policy content not found", null)


        return sendResponse(res, 200, "Privacy policy content found", config.privacyPolicy)

    } catch (err: any) {
        logger.error("error at getting privacy policy is", err)
        sendResponse(res, 500, err.message, null)
    }
};


const setTermAndCond = async (req: Request, res: Response) => {
    try {
        const { termAndConditon } = req.body;

        if (!termAndConditon) {
            return sendResponse(res, 400, "Terms and Condition content not found", null)

        }


        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: { termAndConditon } },
            { upsert: true, new: true } // create if not exists
        );

        return sendResponse(res, 201, "Terms and Condition content updated", config.termAndConditon)

    } catch (err: any) {
        logger.error("error at setting Terms and conditon is", err)
        sendResponse(res, 500, err.message, null)
    }
}

export const getTermsAndCondition = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return sendResponse(res, 200, "Terms and Condition content not found", null)

        res.status(200).json({ aboutUs: config.termAndConditon });
    } catch (err: any) {
        logger.error("error at getting Terms and conditon is", err)
        sendResponse(res, 500, err.message, null)
    }
};

export const getContactInfo = async (req: Request, res: Response) => {
    try {
        const config = await configModel.findById('singleton');
        if (!config) return sendResponse(res, 200, "Contact info not found", null)

        return sendResponse(res, 200, "Contact info found", { Number: config.contactNumber, Email: config.contactEmail })
    } catch (err: any) {
        logger.error("error at getting Contact info is", err)
        sendResponse(res, 500, err.message, null)
    }
};


export const setContactNumber = async (req: Request, res: Response) => {
    try {
        const { contactNumber } = req.body;
        if (!contactNumber) return sendResponse(res, 400, "Contact number not found", false)
        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: { contactNumber } },
            { upsert: true, new: true } // create if not exists
        );

        return sendResponse(res, 400, "Contact number update", true)
    } catch (err: any) {
        logger.error("error at setting Contact info is", err)
        sendResponse(res, 500, err.message, false)
    }
};


export const setContacEmail = async (req: Request, res: Response) => {
    try {
        const { contactEmail } = req.body;
        if (!contactEmail) return sendResponse(res, 400, "Contact email not found", false)
        const config = await configModel.findByIdAndUpdate(
            'singleton',
            { $set: { contactEmail } },
            { upsert: true, new: true } // create if not exists
        );

        return sendResponse(res, 400, "Contact email found", true)
    } catch (err: any) {
        logger.error("error at setting Contact email is", err)
        sendResponse(res, 500, err.message, false)
    }
};

export { updateConfig, getConfig }