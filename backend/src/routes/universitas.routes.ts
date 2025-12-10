import { Router } from "express";
import { listUniversitas } from "../controllers/universitasController";

const router = Router();

router.get("/", listUniversitas);

export default router;
