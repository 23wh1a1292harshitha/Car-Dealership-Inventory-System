import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  return res.status(200).json({
    message: "Authenticated successfully",
    user: req.user,
  });
});

export default router;