import { Router } from "express";
import { getSeleksiNasional, prosesSeleksiAdmin, downloadHasilSeleksiCsv } from "../controllers/adminController";

const router = Router();

router.get("/seleksi", getSeleksiNasional);
router.post("/seleksi/:id", prosesSeleksiAdmin);
router.get("/seleksi/download", downloadHasilSeleksiCsv);

export default router;
