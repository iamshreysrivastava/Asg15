const API_URL = "http://localhost:4000/students";
const AUTH_URL = "http://localhost:4000/users"; // Your User API base URL

// ==========================================
// CENTRAL AUTHENTICATION GUARD (Assignment 15)
// ==========================================

/* Check if token exists, if not kick them out to login.html */
/* Check if token exists, if not kick them out to login.html */
function checkAuthentication() {
    const token = sessionStorage.getItem("token");
    const currentPage = window.location.pathname.split("/").pop();

    // Check if we are on pages that require a login badge
    if (currentPage !== "login.html" && currentPage !== "register.html") {
        if (!token) {
            // DIRECT REDIRECT: No popup alert, just bounce immediately
            window.location.href = "login.html";
            return null;
        }
    } else {
        // If they have a token and try to visit login/register, send them to dashboard
        if (token) {
            window.location.href = "index.html";
            return token;
        }
    }
    return token;
}

/* Clear session browser token and log out */
function handleLogout() {
    sessionStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.href = "login.html";
}


// ==========================================
// 1. DASHBOARD PAGE LOGIC (index.html)
// ==========================================

/* Load All Students and Update Counters */
async function loadStudents() {
    const tableBody = document.getElementById("studentTableBody");
    if (!tableBody) return; 

    const token = checkAuthentication();
    if (!token) return;

    try {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}` // Protect route with token
            }
        });
        
        // Clear sessionStorage if token is rejected/expired
        if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!res.ok) throw new Error("Server responded with an error");
        
        const students = await res.json();
        let data = "";

        // Update Total Student counters dynamically
        const totalCount = students.length;
        if (document.getElementById("statTotal")) {
            document.getElementById("statTotal").innerText = totalCount;
        }
        if (document.getElementById("sectionCount")) {
            document.getElementById("sectionCount").innerText = `${totalCount} Students`;
        }

        if (totalCount === 0) {
            data = `<tr><td colspan="7"><div class="empty-state"><p>No student records found.</p></div></td></tr>`;
        } else {
            students.forEach(student => {
                data += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.age}</td>
                    <td>${student.rollno || student.rollNo || '—'}</td>
                    <td>${student.course}</td>
                    <td>${student.city}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="edit-btn" onclick="editStudent('${student._id}')">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteStudent('${student._id}')">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
                `;
            });
        }

        tableBody.innerHTML = data;
    } catch (error) {
        console.error("Error loading students:", error);
        tableBody.innerHTML = `
            <tr><td colspan="7"><div class="empty-state"><p style="color: #c53030;">Could not connect to server.</p></div></td></tr>
        `;
    }
}

/* Topbar Navigation Handler */
function openAddPage() {
    window.location.href = 'add.html';
}

/* Delete a Student Record */
async function deleteStudent(id) {
    const token = checkAuthentication();
    if (!token) return;

    const confirmDelete = confirm("Do you really want to delete this student?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}` // Protect action with token
            }
        });

        if (res.ok) {
            loadStudents(); 
        } else {
            alert("Failed to delete the student record. Unauthorised action.");
        }
    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Server connection lost while deleting.");
    }
}

/* Redirect to Edit Page with ID Query String */
function editStudent(id) {
    window.location.href = `edit.html?id=${id}`;
}

/* Live Search Filter */
async function searchStudents() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    
    const token = checkAuthentication();
    if (!token) return;

    const value = searchInput.value;

    try {
        const res = await fetch(`${API_URL}?search=${value}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const students = await res.json();
        let data = "";

        students.forEach(student => {
            data += `
            <tr>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.rollno || student.rollNo || '—'}</td>
                <td>${student.course}</td>
                <td>${student.city}</td>
                <td>${student.email}</td>
                <td>
                    <button class="edit-btn" onclick="editStudent('${student._id}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteStudent('${student._id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
            `;
        });

        document.getElementById("studentTableBody").innerHTML = data;
    } catch (error) {
        console.error("Error searching students:", error);
    }
}


// ==========================================
// 2. CREATION PAGE LOGIC (add.html)
// ==========================================

/* Add Student (Used on add.html) */
async function addStudent() {
    const nameField = document.getElementById("name");
    if (!nameField) return; 

    const token = checkAuthentication();
    if (!token) return;

    const name   = nameField.value.trim();
    const age    = Number(document.getElementById("age").value);
    const course = document.getElementById("course").value.trim();
    const city   = document.getElementById("city").value.trim();
    const email  = document.getElementById("email").value.trim();

    if (!name || !email || !age || !course || !city) { 
        alert("Please fill in all fields."); 
        return; 
    }

    try {
        // Fetch current records to calculate next roll no safely
        const rollRes = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const students = await rollRes.json();
        
        let nextRollNo = 1001;
        if (students && students.length > 0) {
            const rollNumbers = students.map(s => Number(s.rollno || s.rollNo || 0));
            nextRollNo = Math.max(...rollNumbers) + 1;
        }

        const studentData = { name, age, course, city, email, rollno: nextRollNo };

        const response = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Protect writing capability
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            alert(`Student successfully added! Assigned Roll No: ${nextRollNo}`);
            window.location.href = 'index.html'; 
        } else {
            alert("Failed to add student. Session expired or validation error.");
        }
    } catch (error) {
        console.error("Error adding student:", error);
        alert("Failed to establish server connection.");
    }
}


// ==========================================
// 3. EDIT/MODIFICATION PAGE LOGIC (edit.html)
// ==========================================

/* Fetch single student details and pre-fill the edit form */
async function loadStudentToEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!document.getElementById("editName") || !id) return;

    const token = checkAuthentication();
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/view/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}` // Protect query profile reading
            }
        });
        
        if (!res.ok) throw new Error("Could not find student record");
        
        const result = await res.json();
        const student = result.data ? result.data : result;

        if (document.getElementById("editId")) {
            document.getElementById("editId").value = student._id;
        }

        document.getElementById("editName").value = student.name || '';
        document.getElementById("editAge").value = student.age || '';
        document.getElementById("editCourse").value = student.course || '';
        document.getElementById("editCity").value = student.city || '';
        document.getElementById("editEmail").value = student.email || '';
        
        if (document.getElementById("editRollNo")) {
            document.getElementById("editRollNo").value = student.rollno || student.rollNo || '';
        }
        if (document.getElementById("editRollNoDisplay")) {
            document.getElementById("editRollNoDisplay").innerText = student.rollno || student.rollNo || '—';
        }

    } catch (error) {
        console.error("Error fetching student profile details:", error);
        alert("Unable to load student data.");
    }
}

/* Save Updated Records */
async function updateStudent() {
    const editIdField = document.getElementById("editId");
    if (!editIdField) return; 

    const token = checkAuthentication();
    if (!token) return;

    const id = editIdField.value;

    const updatedStudent = {
        name: document.getElementById("editName").value,
        course: document.getElementById("editCourse").value,
        age: Number(document.getElementById("editAge").value),
        email: document.getElementById("editEmail").value,
        city: document.getElementById("editCity").value,
        rollno: Number(document.getElementById("editRollNo").value)
    };

    try {
        const response = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Protect record updates
            },
            body: JSON.stringify(updatedStudent)
        });

        if (response.ok) {
            alert("Student details updated successfully.");
            window.location.href = 'index.html';
        } else {
            alert("Failed to update student profile details. Session unauthorized.");
        }
    } catch (error) {
        console.error("Error updating student:", error);
    }
}


// ==========================================
// INITIALIZATION KICK-OFF
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Run the page authentication check immediately upon entry
    const token = checkAuthentication();

    // If the user is authenticated, reveal the page cleanly
    if (token) {
        document.body.style.display = "block";

        if (document.getElementById("studentTableBody")) {
            loadStudents();
        }
        
        if (document.getElementById("editName")) {
            loadStudentToEdit();
        }
    }
});