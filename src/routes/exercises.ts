import { Router } from "express";
import {
  addExercise,
  getLogs,
} from "../controllers/exercises.ts";

const router = Router();

router.post("/:id/exercises", addExercise);
router.get("/:id/logs", getLogs);

export default router;
