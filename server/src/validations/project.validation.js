import Joi from "joi";

export const projectValidation = {
  create: Joi.object({
    data: Joi.string()
      .required()
      .messages({
        "string.empty": "Project data is required",
        "any.required": "Project data is required",
      })
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          return validateProjectData(parsed, helpers);
        } catch (error) {
          return helpers.error("any.invalid");
        }
      }),
  }),

  update: Joi.object({
    data: Joi.string()
      .required()
      .messages({
        "string.empty": "Project data is required",
        "any.required": "Project data is required",
      })
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          return validateProjectData(parsed, helpers);
        } catch (error) {
          return helpers.error("any.invalid");
        }
      }),
  }),
};

const validateProjectData = (data, helpers) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    start_date: Joi.date().required(),
    end_date: Joi.date().allow(null),
    city: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    client_name: Joi.string().allow(null, ""),
    category_id: Joi.string().required(),
    area: Joi.number().allow(null),
    is_featured: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).allow(null),

    gallery: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().allow(null), // for updates
          title: Joi.string().allow(null, ""),
          subtitle: Joi.string().allow(null, ""),
        })
      )
      .allow(null),

    key_features: Joi.array().items(Joi.string()).allow(null),
    services: Joi.array().items(Joi.string()).allow(null),
  });

  const { error, value } = schema.validate(data);
  if (error) {
    return helpers.error("any.invalid", { message: error.details[0].message });
  }
  return value;
};
