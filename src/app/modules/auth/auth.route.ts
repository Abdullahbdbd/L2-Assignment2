import express from "express";
import { signup } from "./auth.controller";
import { login } from "./auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);

export default router;