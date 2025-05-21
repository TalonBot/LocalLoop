const { body } = require("express-validator");

const VALID_CATEGORIES = [
  "Honey",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Handmade",
  "Other",
];

const productValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("quantity_available")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or more"),

  body("unit")
    .notEmpty()
    .withMessage("Unit is required")
    .isLength({ max: 20 })
    .withMessage("Unit is too long"),

  body("is_available")
    .isBoolean()
    .withMessage("is_available must be a boolean"),
];

module.exports = productValidationRules;
