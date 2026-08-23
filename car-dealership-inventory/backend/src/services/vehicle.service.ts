import { prisma } from "../config/prisma";

export const createVehicle = async (
  make: string,
  model: string,
  category: string,
  price: number,
  quantity: number
) => {
  return await prisma.vehicle.create({
    data: {
      make,
      model,
      category,
      price,
      quantity,
    },
  });
};

export const getAllVehicles = async (
  make?: string,
  model?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  currentPage: number = 1,
  pageLimit: number = 10
) => {
  const skip = (currentPage - 1) * pageLimit;

  const where = {
    ...(make && {
      make: {
        contains: make,
        mode: "insensitive" as const,
      },
    }),

    ...(model && {
      model: {
        contains: model,
        mode: "insensitive" as const,
      },
    }),

    ...(category && {
      category: {
        contains: category,
        mode: "insensitive" as const,
      },
    }),

    ...(minPrice !== undefined && {
      price: {
        gte: minPrice,
      },
    }),

    ...(maxPrice !== undefined && {
      price: {
        lte: maxPrice,
      },
    }),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageLimit,
    }),

    prisma.vehicle.count({
      where,
    }),
  ]);

  return {
    vehicles,
    pagination: {
      currentPage,
      pageLimit,
      totalVehicles: total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

export const getVehicleById = async (id: number) => {
  return await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });
};

export const updateVehicle = async (
  id: number,
  make: string,
  model: string,
  category: string,
  price: number,
  quantity: number
) => {
  return await prisma.vehicle.update({
    where: {
      id,
    },
    data: {
      make,
      model,
      category,
      price,
      quantity,
    },
  });
};

export const deleteVehicle = async (id: number) => {
  return await prisma.vehicle.delete({
    where: {
      id,
    },
  });
};
export const purchaseVehicle = async (id: number) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.quantity <= 0) {
    throw new Error("Vehicle is out of stock");
  }

  return await prisma.vehicle.update({
    where: {
      id,
    },
    data: {
      quantity: {
        decrement: 1,
      },
    },
  });
};
export const restockVehicle = async (
  id: number,
  quantity: number
) => {
  return await prisma.vehicle.update({
    where: {
      id,
    },
    data: {
      quantity: {
        increment: quantity,
      },
    },
  });
};