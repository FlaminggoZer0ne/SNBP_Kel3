import { Router } from "express";
import infoRouter from "./info.routes";
import authRouter from "./auth.routes";
import pendaftaranRouter from "./pendaftaran.routes";
import universitasRouter from "./universitas.routes";
import profilRouter from "./profil.routes";
import simulasiRouter from "./simulasi.routes";
import bkRouter from "./bk.routes";
import kepsekRouter from "./kepsek.routes";
import adminRouter from "./admin.routes";
import homeRouter from "./home.routes";

const router = Router();

router.use("/", infoRouter);
router.use("/auth", authRouter);
router.use("/pendaftaran", pendaftaranRouter);
router.use("/universitas", universitasRouter);
router.use("/profil", profilRouter);
router.use("/simulasi", simulasiRouter);
router.use("/bk", bkRouter);
router.use("/kepsek", kepsekRouter);
router.use("/admin", adminRouter);
router.use("/home", homeRouter);

export default router;
