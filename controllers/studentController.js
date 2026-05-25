const Student = require("../models/Student");

/* Get All Students */

exports.getAllStudents = async (req, res) => {

    try {

        const search = req.query.search || "";

        const students = await Student.find({

            $or: [

                { name: { $regex: search, $options: "i" } },

                { course: { $regex: search, $options: "i" } },

                { city: { $regex: search, $options: "i" } }

            ]

        });

        res.status(200).json(students);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

/* Add Student */

exports.addStudent = async (req, res) => {

    try {

        const student = await Student.create(req.body);

        res.status(201).json({
            message: "Student Added Successfully",
            student
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });
    }
};

/* View Single Student */

exports.getSingleStudent = async (req, res) => {

    try {

        const student = await Student.findById(req.params.id);

        if (!student) {

            return res.status(404).json({
                message: "Student Not Found"
            });
        }

        res.status(200).json(student);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

/* Update Student */

exports.updateStudent = async (req, res) => {

    try {

        const student = await Student.findByIdAndUpdate(

            req.params.id,
            req.body,
            { new: true }

        );

        res.status(200).json({
            message: "Student Updated Successfully",
            student
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });
    }
};

/* Delete Student */

exports.deleteStudent = async (req, res) => {

    try {

        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Student Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};