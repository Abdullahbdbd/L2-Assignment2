import type{ Request, Response } from "express";
import { createIssue, deleteIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.service";


export const deleteIssueController = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deleteIssue(id);

    res.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateIssueController = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await updateIssue(id, req.body, req.user);

    res.json({
      success: true,
      message: "Issue updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleIssueController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const issue = await getSingleIssue(id);

    res.json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllIssuesController = async (req: Request, res: Response) => {
  try {
    const issues = await getAllIssues(req.query);

    res.json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createIssueController = async (req: any, res: Response) => {
  try {
    const issue = await createIssue(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};