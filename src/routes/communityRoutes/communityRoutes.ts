import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import {
  CommunityId,
  CreateCommunity,
  EditCommunity,
  type CommunityIdParams,
  type CreateCommunityInput,
  type EditCommunityInput,
} from "./communitySchema";
import communityServices from "../../services/communityServices/communityServices";

const communityRouter = express.Router();

communityRouter.post("/create", isAuthenticated, async (req, res, next) => {
  try {
    const validatedData: CreateCommunityInput = CreateCommunity.parse(req.body);
    const createdCommunity = await communityServices.createCommunityService(
      validatedData,
      req.session.userId!,
    );

    res.status(201).json({
      status: "SUCCESS",
      message: `Successfully created ${createdCommunity.name}`,
      createdCommunity,
    });
  } catch (err) {
    next(err);
  }
});

communityRouter.put("/edit{/:id}", isAuthenticated, async (req, res, next) => {
  try {
    const validatedParams: CommunityIdParams = CommunityId.parse(req.params);
    const validatedData: EditCommunityInput = EditCommunity.parse(req.body);

    const editedCommunity = await communityServices.editCommunityService(
      validatedData,
      validatedParams,
      req.session.userId!,
    );

    res.status(201).json({
      status: "SUCCESS",
      message: `Successfully edited com`,
      editedCommunity,
    });
  } catch (err) {
    next(err);
  }
});

export default communityRouter;
