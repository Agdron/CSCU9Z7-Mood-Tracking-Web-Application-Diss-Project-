async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("login-message");

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Determine target URL based on user role
            let targetUrl = "";
            if (result.role === "user") {
                targetUrl = "user-client.html";
            } else if (result.role === "admin") {
                targetUrl = "admin-client.html";
            }
            // Store target URL in session storage for use after modal is closed
            sessionStorage.setItem("targetUrl", targetUrl);
            // Show the consent modal
            showConsentModal();
        } else {
            loginMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Login failed:", error);
        loginMessage.style.display = "block";
    }
}

// Function to show the data consent modal and redirect after it is dismissed
function showConsentModal() {
    const consentModalEl = document.getElementById('consentModal');
    const consentModal = new bootstrap.Modal(consentModalEl);
    // Listen for the modal being hidden so we can then redirect
    consentModalEl.addEventListener('hidden.bs.modal', () => {
        const targetUrl = sessionStorage.getItem("targetUrl");
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    }, { once: true });
    consentModal.show();
}

// Attach the login function to the global scope
window.login = login;
