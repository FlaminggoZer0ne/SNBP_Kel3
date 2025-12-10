import { Router } from "express"
import { listPendaftaranKepsek, updatePendaftaranKepsek, updateEligibilityKepsek, listSiswaKepsek } from "../controllers/kepsekController"

const router = Router()

router.get("/pendaftaran", listPendaftaranKepsek)
router.get("/siswa", listSiswaKepsek)
router.patch("/pendaftaran/:id", updatePendaftaranKepsek)
router.post("/siswa/:userId/eligibility", updateEligibilityKepsek)

export default router
