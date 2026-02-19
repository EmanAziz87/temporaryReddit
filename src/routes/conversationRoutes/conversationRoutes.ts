import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import {
  ConversationParamsData,
  type ConversationParams,
} from "./conversationSchema";
import conversationServices from "../../services/conversationServices/conversationServices";

const conversationRouter = express.Router();

conversationRouter.post(
  "/:receiverId/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: ConversationParams = ConversationParamsData.parse(
        req.params,
      );

      const createdConversation =
        await conversationServices.createConversationService(
          validatedParams.receiverId,
          req.session.userId,
        );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully created conversation group",
        createdConversation,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default conversationRouter;
