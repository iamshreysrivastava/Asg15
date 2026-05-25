const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/* /users/register */
router.post("/register", userController.registerUser);

/* /users/login */
router.post("/login", userController.loginUser);

module.exports = router;