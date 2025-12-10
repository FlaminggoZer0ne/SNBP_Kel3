import { Router } from 'express'
import { getHomeContent, saveHomeContent } from '../controllers/homeController'

const router = Router()

router.get('/content', getHomeContent)
router.post('/content', saveHomeContent)

export default router
