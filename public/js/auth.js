const authForm = document.querySelector(".auth-container #sign-up");
const submitBtn = authForm.querySelector("button[type='submit']");
const fullnameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");


// Create a small status element
let statusElement = document.querySelector(".form-status");
if (!statusElement) {
    statusElement = document.createElement("p");
    statusElement.className = "form-status";
    statusElement.style.fontSize = "12px";
    statusElement.style.textAlign = "center";
    authForm.insertBefore(statusElement, submitBtn);
}

// helper functions
const setStatus = (msg, color = "#111") => {
    statusElement.textContent = msg;
    statusElement.style.color = color;
}

const clearStatus = () => setStatus("", "#111");

const validationEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// show a simple spinner inside the submit button
const setLoading = (loading) => {
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.dataset.origText = submitBtn.textContent;
        submitBtn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Sending...`
    } else {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.textContent = submitBtn.dataset.origText || "Sign Up"
    }
}

// timeout helper for fetch
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out!!")), timeout))
    ]);
}


authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

    if (fullname.length < 2) {
        setStatus("Please enter your fullname", "#ef4444");
        fullnameInput.focus();
        return;
    }

    if (!validationEmail(email)) {
        setStatus("Please enter a valid email", "#ef4444");
        emailInput.focus();
        return;
    }

    if (password.length < 6) {
        setStatus("Password should be at least 6 characters", "#ef4444");
        passwordInput.focus();
        return;
    }

    if (password !== confirm) {
        setStatus("Password fields are not matching!!", "#ef4444");
        passwordInput.focus();
        confirmInput.focus();
        return;
    }

    // prepare payload
    const payload = { fullname, email, password };

    setLoading(true);

    try {
        const response = await fetch("/api/auth/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            console.log(response);
        }
        setStatus("Account created successfully!", "#16a34a");


        // delay before you route to the home page
        setTimeout(() => {
            window.location.href = "/";
         }, 5000);
    } catch (error) {
        console.error("Something went wrong!", error);
        setStatus(error.message || "An unexpected error occured!", "#ef4444");
    } finally {
        setLoading(false);
    }
})



