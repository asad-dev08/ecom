import Joi from "joi";

export const categoryValidation = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().min(2).max(100).messages({
        "string.empty": "Category name is required",
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name cannot exceed 100 characters",
      }),
      description: Joi.string().allow("").max(500).messages({
        "string.max": "Description cannot exceed 500 characters",
      }),
    }),
  }),

  update: Joi.object({
    params: Joi.object({
      id: Joi.string().required().messages({
        "string.empty": "Category ID is required",
      }),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100).messages({
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name cannot exceed 100 characters",
      }),
      description: Joi.string().allow("").max(500).messages({
        "string.max": "Description cannot exceed 500 characters",
      }),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  }),
};
