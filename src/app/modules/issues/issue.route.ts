import express from "express";
import { auth } from "../../middlewares/auth";
import { createIssueController } from "./issue.controller";
import { getAllIssuesController } from "./issue.controller";
import { getSingleIssueController } from "./issue.controller";
import { updateIssueController } from "./issue.controller";
import { role } from "../../middlewares/role";
import { deleteIssueController } from "./issue.controller";


const router = express.Router();

router.delete(
  "/:id",
  auth,
  role(["maintainer"]),
  deleteIssueController
);
router.patch("/:id", auth, updateIssueController);
router.get("/:id", getSingleIssueController);
router.get("/", getAllIssuesController);
router.post("/", auth, createIssueController);

export default router;