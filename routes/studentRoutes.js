const express = require("express");

const router = express.Router();

const studentController = require("../controllers/studentController");

/* GET ALL */

router.get("/", studentController.getAllStudents);

/* ADD */

router.post("/add", studentController.addStudent);

/* GET SINGLE */

router.get("/view/:id", studentController.getSingleStudent);

/* UPDATE */

router.put("/update/:id", studentController.updateStudent);

/* DELETE */

router.delete("/delete/:id", studentController.deleteStudent);

module.exports = router;