import { Router } from "express";
import { simulasiPeluang } from "../controllers/simulasiController";

const router = Router();

router.post("/", simulasiPeluang);

export default router;
