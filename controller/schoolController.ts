import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import crypto from "crypto";
import { verifiedEmail } from "../utils/email";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import lodash from "lodash";

export const viewSchoolTopStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolClasses = await schoolModel.findById(schoolID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const rate = lodash.orderBy(
      schoolClasses?.students,
      ["totalPerformance"],
      ["desc"]
    );

    return res.status(200).json({
      message: "finding class students top performance!",
      status: 200,
      data: rate,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const loginSchool = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, enrollmentID } = req.body;

    const school = await schoolModel.findOne({
      email,
    });

    if (school) {
      if (school.enrollmentID === enrollmentID) {
        if (school.verify) {
          const token = jwt.sign({ status: school.status }, "school", {
            expiresIn: "1d",
          });

          req.session.isAuth = true;
          req.session.isSchoolID = school._id;

          return res.status(201).json({
            message: "welcome back",
            data: token,
            user: school?.status,
            id: req.session.isSchoolID,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "please check your email to verify your account",
          });
        }
      } else {
        return res.status(404).json({
          message: "Error reading your school enrollment ID",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }

    return res.status(201).json({
      message: "creating school",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school",
    });
  }
};

export const createSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const id = crypto.randomBytes(4).toString("hex");
    const school = await schoolModel.create({
      email,
      enrollmentID: id,
      status: "school-admin",
    });

    verifiedEmail(school);

    return res.status(201).json({
      message: "creating school",
      data: school,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school",
      data: error.message,
      status: 404,
    });
  }
};

export const verifySchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { verify: true },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    return res.status(200).json({
      message: "viewing school record",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatusByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolName } = req.params;

    const school = await schoolModel.findOne({ schoolName });

    return res.status(200).json({
      message: "viewing school record by her name",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const logoutSchool = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    req.session.destroy();

    return res.status(200).json({
      message: "GoodBye",
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const readSchoolCookie = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const readSchool = req.session.isSchoolID;

    return res.status(200).json({
      message: "GoodBye",
      data: readSchool,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewAllSchools = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const school = await schoolModel.find();

    return res.status(200).json({
      message: "viewing all school",
      data: school,
      length: school.length,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const deleteSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    await schoolModel.findByIdAndDelete(schoolID);

    return res.status(200).json({
      message: "school deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolName },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { address } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { address },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

// school Image/Logo

export const updateSchoolAvatar = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school avatar has been, added",
        data: updatedSchool,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};
// school shool has started

export const updateSchoolStartPossition = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          started: true,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school has started, operation",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};

export const changeSchoolTag = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolTags } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolTags },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};
