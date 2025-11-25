// loader for user fetch logic
document.body.classList.add("loading");
(async function () {
  try {
    const response = await axios.get("/api/auth/me", {
      withCredentials: true,
    });
    if (response.status === 200) {
      window.location.href = "/";
      return;
    }
  } catch (error) {
    console.error("Failed to retrieve user");
  } finally {
    document.body.classList.remove("loading");
    document.getElementById("page-loader").style.display = "none";
    document.getElementById("page-content").style.display = "block";
  }
})();

const authForm = document.querySelector(".auth-form");
const submitBtn = authForm.querySelector("button[type='submit']");
const fullnameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

const { pathname } = window.location;

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
};

const clearStatus = () => setStatus("", "#111");

const validationEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// show a simple spinner inside the submit button
const setLoading = (loading) => {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.dataset.origText = submitBtn.textContent;
    submitBtn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Sending...`;
  } else {
    submitBtn.disabled = false;
    submitBtn.removeAttribute("aria-busy");
    submitBtn.textContent = submitBtn.dataset.origText || "Sign Up";
  }
};

/**
 * ! Check client network status
 */

window.addEventListener("offline", () => {
  alert("You are offline. Check your network!");
});

window.addEventListener("online", () => {
  alert("Back online!");
});

/**
 * AXIOS GLOBAL CONFIG
 */

axios.defaults.withCredentials = true;

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus();

  if (!navigator.onLine) {
    setStatus("You are offline. Check your internet connection.", "#ef4444");
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // only read these if we are on sign-up page
  let fullname = null;
  let confirm = null;

  const isSignup = pathname.includes("sign-up");
  const isSignIn = pathname.includes("sign-in");


  if (isSignup) {
    fullname = fullnameInput.value.trim();
    confirm = confirmInput.value.trim();
  }

  if (isSignup && fullname.length < 2) {
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

  if (isSignup && password !== confirm) {
    setStatus("Password fields are not matching!!", "#ef4444");
    passwordInput.focus();
    confirmInput.focus();
    return;
  }

  // prepare payload
  const payload = isSignup ? { fullname, email, password } : { email, password };

  setLoading(true);

  try {
    if (isSignup) {
      const response = await axios.post("/api/auth/sign-up", payload);

      setStatus("Account created successfully!", "#16a34a");

      // delay before you route to the home page
      setTimeout(() => {
        window.location.href = "/auth/sign-in.html";
      }, 5000);
    }

    if (isSignIn) {
      const response = await axios.post("/api/auth/sign-in", payload, {
        withCredentials: true,
      });

      setStatus("Login successful!", "#16a34a");

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  } catch (error) {
    console.error("Something went wrong!", error);
    setStatus(
      error.response.data.message || "An unexpected error occured!",
      "#ef4444"
    );
  } finally {
    setLoading(false);
  }
});
