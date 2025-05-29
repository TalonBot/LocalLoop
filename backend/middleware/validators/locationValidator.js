// backend/middleware/validators/locationValidator.js
const { body } = require("express-validator");

const validateLocation = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid number between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid number between -180 and 180"),
];

module.exports = { validateLocation };
