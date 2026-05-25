const User = require("../models/User");

/* REGISTER USER */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Create new user (In a production environment, you would hash the password here)
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration backend error:", error);
        res.status(500).json({ message: "Server validation or schema rejection error." });
    }
};

/* LOGIN USER */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password configuration." });
        }

        // Simple token generation for Assignment 15 integration validation
        const mockToken = "mock_jwt_token_for_asg15_" + user._id;

        res.status(200).json({
            message: "Login successful",
            token: mockToken
        });
    } catch (error) {
        console.error("Login backend error:", error);
        res.status(500).json({ message: "Server connection failed during login processing." });
    }
};