const AUTH_URL = "http://localhost:4000/users";

// --- LOGIN HANDLER ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                // Extracts the security passport token string handed back by your backend API
                const token = result.token || (result.data && result.data.token);
                
                if (token) {
                    sessionStorage.setItem("token", token);// Store badge safely inside browser wallet
                    alert("Login Successful!");
                    window.location.href = "index.html"; // Open dashboard access
                } else {
                    alert("Authentication structural mismatch: No token key found in server response.");
                }
            } else {
                alert(result.message || "Invalid email string credentials or password configuration.");
            }
        } catch (error) {
            console.error("Login interface failure:", error);
            alert("Could not reach user authorization node.");
        }
    });
}

// --- REGISTRATION HANDLER ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;

        try {
            const response = await fetch(`${AUTH_URL}/register`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Account registration successful! Moving to validation screen...");
                window.location.href = "login.html";
            } else {
                alert(result.message || "Schema constraint violation while registering.");
            }
        } catch (error) {
            console.error("Registration structural failure:", error);
            alert("Could not establish outbound tunnel connection.");
        }
    });
}