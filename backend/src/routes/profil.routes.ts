import { Router } from "express";
import {
  tambahNilai,
  listNilai,
  tambahPrestasi,
  listPrestasi,
  cekEligibility,
  updateNilai,
  deleteNilai,
  deleteNilaiBySemester,
  getProfil,
  updateProfil,
  cekProfilLengkap,
  getEligibilityStatus,
} from "../controllers/profilController";

const router = Router();

router.post("/nilai", tambahNilai);
router.get("/nilai", listNilai);
router.put("/nilai/:id", updateNilai);
router.delete("/nilai/:id", deleteNilai);
router.post("/nilai/semester", deleteNilaiBySemester);
router.post("/prestasi", tambahPrestasi);
router.get("/prestasi", listPrestasi);
router.get("/eligibility", cekEligibility);
router.get("/eligibility-status", getEligibilityStatus);
router.get("/siswa", getProfil);
router.post("/siswa", updateProfil);
router.get("/siswa/cek-lengkap", cekProfilLengkap);

export default router;
