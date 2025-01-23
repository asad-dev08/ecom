import Joi from "joi";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Combine all possible sources of data
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files,
    };

    const { error } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: false, // Don't remove unknown elements from objects
    });

    if (error) {
      // Format validation errors
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""),
      }));

      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    next();
  };
};

// Example usage with project validation schema
export const projectValidation = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().min(3).max(100).messages({
        "string.empty": "Project name is required",
        "string.min": "Project name must be at least 3 characters long",
        "string.max": "Project name cannot exceed 100 characters",
      }),
      description: Joi.string().allow("").max(1000).messages({
        "string.max": "Description cannot exceed 1000 characters",
      }),
      start_date: Joi.date().required().messages({
        "date.base": "Start date must be a valid date",
        "any.required": "Start date is required",
      }),
      end_date: Joi.date().min(Joi.ref("start_date")).messages({
        "date.base": "End date must be a valid date",
        "date.min": "End date must be after start date",
      }),
      status: Joi.string()
        .valid("PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD")
        .default("PENDING")
        .messages({
          "any.only":
            "Status must be one of: PENDING, IN_PROGRESS, COMPLETED, ON_HOLD",
        }),
      budget: Joi.number().positive().messages({
        "number.base": "Budget must be a number",
        "number.positive": "Budget must be a positive number",
      }),
      client_id: Joi.number().positive().required().messages({
        "number.base": "Client ID must be a number",
        "any.required": "Client ID is required",
      }),
    }),
    files: Joi.object({
      thumbnail: Joi.array()
        .items(
          Joi.object({
            fieldname: Joi.string().required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string()
              .valid("image/jpeg", "image/png", "image/gif")
              .required(),
            size: Joi.number()
              .max(5 * 1024 * 1024)
              .required(), // 5MB max
          })
        )
        .max(1),
      gallery: Joi.array()
        .items(
          Joi.object({
            fieldname: Joi.string().required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string()
              .valid("image/jpeg", "image/png", "image/gif")
              .required(),
            size: Joi.number()
              .max(5 * 1024 * 1024)
              .required(), // 5MB max
          })
        )
        .max(50),
    }),
  }),

  update: Joi.object({
    params: Joi.object({
      id: Joi.number().required().messages({
        "number.base": "Project ID must be a number",
        "any.required": "Project ID is required",
      }),
    }),
    body: Joi.object({
      name: Joi.string().min(3).max(100),
      description: Joi.string().allow("").max(1000),
      start_date: Joi.date(),
      end_date: Joi.date().min(Joi.ref("start_date")),
      status: Joi.string().valid(
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "ON_HOLD"
      ),
      budget: Joi.number().positive(),
      client_id: Joi.number().positive(),
    })
      .min(1) // Require at least one field to be updated
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
    files: Joi.object({
      thumbnail: Joi.array()
        .items(
          Joi.object({
            fieldname: Joi.string().required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string()
              .valid("image/jpeg", "image/png", "image/gif")
              .required(),
            size: Joi.number()
              .max(5 * 1024 * 1024)
              .required(),
          })
        )
        .max(1),
      gallery: Joi.array()
        .items(
          Joi.object({
            fieldname: Joi.string().required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string()
              .valid("image/jpeg", "image/png", "image/gif")
              .required(),
            size: Joi.number()
              .max(5 * 1024 * 1024)
              .required(),
          })
        )
        .max(50),
    }),
  }),
};
