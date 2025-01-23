import { getNamespace } from "cls-hooked";
import { prismaClient } from "../index.js";

const getModelFields = (model) => {
  const modelFields = Object.keys(prismaClient[model].fields || {});
  const excludeFields = [
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "password",
  ];
  const searchableTypes = ["String", "Int", "Float", "Boolean"];

  return modelFields.filter((field) => {
    const fieldType = prismaClient[model].fields[field].type;
    return (
      !excludeFields.includes(field) && searchableTypes.includes(fieldType)
    );
  });
};

export const getPaginatedData = async ({
  model,
  page = 1,
  pageSize = 10,
  filters = [],
  sorting = [{ field: "id", order: "asc" }],
  globalSearch = "",
  include = null,
}) => {
  try {
    const namespace = getNamespace("app");
    const loggedUser = namespace.get("user");
    const user = await prismaClient.user.findFirst({
      where: { id: loggedUser.id },
    });

    let whereClause = {};

    if (user && !user.is_admin) {
      whereClause = {
        ...whereClause,
        company_id: user.company_id,
      };
    }

    // Handle filters
    if (filters && filters.length > 0) {
      const filterConditions = filters.map((filter) => {
        const { field, value, operator } = filter;

        switch (operator) {
          case "contains":
            return {
              [field]: {
                contains: value,
              },
            };
          case "equals":
            return {
              [field]: value,
            };
          case "in":
            return {
              [field]: {
                in: value,
              },
            };
          default:
            return {};
        }
      });

      whereClause = {
        AND: [
          ...(Object.keys(whereClause).length > 0 ? [whereClause] : []),
          ...filterConditions,
        ],
      };
    }

    // Handle global search
    if (globalSearch) {
      const searchableFields = getModelFields(model);
      const searchClause = {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: globalSearch,
            mode: "insensitive",
          },
        })),
      };

      whereClause = {
        AND: [
          ...(Object.keys(whereClause).length > 0 ? [whereClause] : []),
          searchClause,
        ],
      };
    }

    // Convert sorting array to Prisma orderBy object
    const orderBy = sorting.map((sort) => ({
      [sort.field]: sort.order.toLowerCase(),
    }));

    // Base query options
    const queryOptions = {
      where: whereClause,
      skip: (parseInt(page) - 1) * parseInt(pageSize),
      take: parseInt(pageSize),
      orderBy,
    };

    // Add include if provided
    if (include) {
      queryOptions.include = include;
    }

    // Get paginated data with includes
    const rows = await prismaClient[model].findMany(queryOptions);

    // Get total count
    const total = await prismaClient[model].count({
      where: whereClause,
    });

    return {
      total: { total },
      rows,
    };
  } catch (error) {
    console.error("Pagination error:", error);
    throw error;
  }
};
