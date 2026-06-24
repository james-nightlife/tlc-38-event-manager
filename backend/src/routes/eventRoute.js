import express from "express";

import { register, visit } from "../controllers/eventController.js";

const router = express.Router();

router.get("/register/:day/:id", register);
router.get("/visit/:day/:id/:boot", visit);

export default router;
