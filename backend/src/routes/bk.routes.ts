import { Router } from "express";
import { listPendaftaranBK, updateStatusPendaftaranBK, deletePendaftaranBK, kirimKeKepsekBK, updateEligibilityBK, listSiswaBK } from "../controllers/bkController";

const router = Router();

router.get("/pendaftaran", listPendaftaranBK);
router.get("/siswa", listSiswaBK);
router.patch("/pendaftaran/:id/status", updateStatusPendaftaranBK);
router.delete("/pendaftaran/:id", deletePendaftaranBK);
router.post("/pendaftaran/:id/kirim-ke-kepsek", kirimKeKepsekBK);
router.post("/siswa/:userId/eligibility", updateEligibilityBK);

export default router;
