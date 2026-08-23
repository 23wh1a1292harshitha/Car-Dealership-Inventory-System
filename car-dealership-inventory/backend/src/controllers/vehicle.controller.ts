import { Request, Response } from "express";
import { Prisma } from "../generated/client";
import {
  createVehicle as createVehicleService,
  getAllVehicles,
  getVehicleById,
  updateVehicle as updateVehicleService,
  deleteVehicle as deleteVehicleService,
  purchaseVehicle as purchaseVehicleService,
  restockVehicle as restockVehicleService,
} from "../services/vehicle.service";
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message: "All vehicle fields are required",
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        message: "Price and quantity cannot be negative",
      });
    }

    const vehicle = await createVehicleService(
      make,
      model,
      category,
      Number(price),
      Number(quantity)
    );

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create vehicle",
    });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const {
      make,
      model,
      category,
      minPrice,
      maxPrice,
      page,
      limit,
    } = req.query;

  const currentPage = page !== undefined ? Number(page) : 1;
const pageLimit = limit !== undefined ? Number(limit) : 10;

if (
  Number.isNaN(currentPage) ||
  Number.isNaN(pageLimit) ||
  currentPage < 1 ||
  pageLimit < 1
) {
  return res.status(400).json({
    message: "Page and limit must be valid positive numbers",
  });
}
    if (
      minPrice !== undefined &&
      (Number.isNaN(Number(minPrice)) || Number(minPrice) < 0)
    ) {
      return res.status(400).json({
        message: "Invalid minimum price",
      });
    }

    if (
      maxPrice !== undefined &&
      (Number.isNaN(Number(maxPrice)) || Number(maxPrice) < 0)
    ) {
      return res.status(400).json({
        message: "Invalid maximum price",
      });
    }

    const result = await getAllVehicles(
      make as string | undefined,
      model as string | undefined,
      category as string | undefined,
      minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice !== undefined ? Number(maxPrice) : undefined,
      currentPage,
      pageLimit
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch vehicles",
    });
  }
};

export const getVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      vehicle,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch vehicle",
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { make, model, category, price, quantity } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message: "All vehicle fields are required",
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        message: "Price and quantity cannot be negative",
      });
    }

    const vehicle = await updateVehicleService(
      id,
      make,
      model,
      category,
      Number(price),
      Number(quantity)
    );

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(500).json({
      message: "Failed to update vehicle",
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    await deleteVehicleService(id);

    return res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(500).json({
      message: "Failed to delete vehicle",
    });
  }
};
export const purchaseVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await purchaseVehicleService(id);

    return res.status(200).json({
      message: "Vehicle purchased successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "Vehicle not found") {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      if (error.message === "Vehicle is out of stock") {
        return res.status(400).json({
          message: "Vehicle is out of stock",
        });
      }
    }

    return res.status(500).json({
      message: "Failed to purchase vehicle",
    });
  }
};
export const restockVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    if (
      quantity === undefined ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        message: "Restock quantity must be greater than 0",
      });
    }

    const vehicle = await restockVehicleService(
      id,
      Number(quantity)
    );

    return res.status(200).json({
      message: "Vehicle restocked successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(500).json({
      message: "Failed to restock vehicle",
    });
  }
};