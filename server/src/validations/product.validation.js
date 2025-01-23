import Joi from "joi";

export const productValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().positive(),
    compareAtPrice: Joi.number().positive().allow(null),
    stock: Joi.number().integer().required().min(0),
    categoryId: Joi.string().required(),
    subcategoryId: Joi.string().required(),
    brandId: Joi.string().required(),
    sellerId: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().required(),
    isFeatured: Joi.boolean(),
    isNew: Joi.boolean(),
    onSale: Joi.boolean(),
    attributes: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        value: Joi.string().required(),
        unit: Joi.string(),
        displayValue: Joi.string(),
        options: Joi.array().items(Joi.string()),
      })
    ),
    variants: Joi.array().items(
      Joi.object({
        sku: Joi.string().required(),
        price: Joi.number().required().positive(),
        stock: Joi.number().integer().required().min(0),
        attributes: Joi.object().required(),
      })
    ),
  }),

  update: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    description: Joi.string(),
    price: Joi.number().positive(),
    compareAtPrice: Joi.number().positive().allow(null),
    stock: Joi.number().integer().min(0),
    categoryId: Joi.string(),
    subcategoryId: Joi.string(),
    brandId: Joi.string(),
    sellerId: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string(),
    isFeatured: Joi.boolean(),
    isNew: Joi.boolean(),
    onSale: Joi.boolean(),
    attributes: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        value: Joi.string().required(),
        unit: Joi.string(),
        displayValue: Joi.string(),
        options: Joi.array().items(Joi.string()),
      })
    ),
    variants: Joi.array().items(
      Joi.object({
        sku: Joi.string().required(),
        price: Joi.number().required().positive(),
        stock: Joi.number().integer().required().min(0),
        attributes: Joi.object().required(),
      })
    ),
  }),

  getById: Joi.object({
    id: Joi.string().required(),
  }),

  delete: Joi.object({
    id: Joi.string().required(),
  }),
};
