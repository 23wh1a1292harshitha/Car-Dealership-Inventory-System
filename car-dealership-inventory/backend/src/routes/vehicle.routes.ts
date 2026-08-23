import { Router } from "express";

import {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from "../controllers/vehicle.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

// Any authenticated user can view vehicles
router.get("/", authMiddleware, getVehicles);

router.get("/:id", authMiddleware, getVehicle);

// Only ADMIN can modify inventory
router.post("/", authMiddleware, adminMiddleware, createVehicle);

router.put("/:id", authMiddleware, adminMiddleware, updateVehicle);

router.delete("/:id", authMiddleware, adminMiddleware, deleteVehicle);

router.post("/:id/purchase", authMiddleware, purchaseVehicle);

// Only ADMIN can restock inventory
router.post(
  "/:id/restock",
  authMiddleware,
  adminMiddleware,
  restockVehicle
);

export default router;