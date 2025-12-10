import { Router } from "express";
import {
  createPendaftaran,
  listAllPendaftaran,
  listPendaftaranByEmail,
  cekPengumumanByNomor,
} from "../controllers/pendaftaranController";

const router = Router();

router.post("/", createPendaftaran);
router.get("/", listPendaftaranByEmail);
router.get("/all", listAllPendaftaran);
router.get("/cek", cekPengumumanByNomor);

export default router;
