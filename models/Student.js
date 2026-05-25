const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    rollno: {
        type: Number,
        unique: true,
        required: true
    },

    course: {
        type: String
    },

    age: {
        type: Number,
        min: 16
    },

    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/
    },

    city: {
        type: String
    }

});

module.exports = mongoose.model("Student", studentSchema);