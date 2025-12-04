// mobile-nav.js
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mobile-bottom-nav");
  const authBtn = document.getElementById("auth-btn");
  const authText = document.getElementById("auth-text");
  const currentPath = window.location.pathname;

  // Highlight active page
  document.querySelectorAll(".nav-item").forEach(item => {
    const href = item.getAttribute("href");
    if (href && (currentPath === href || currentPath.startsWith(href + "?") || currentPath.startsWith(href + "#"))) {
      item.classList.add("active");
    }
  });

  // Check login state
  async function updateAuthButton() {
    try {
      const { data } = await axios.get("/api/auth/me", { withCredentials: true });
      const user = data.user;

      if (user) {
        authText.textContent = "Profile";
        authBtn.href = "/profile";
        authBtn.classList.add("logged-in");
        authBtn.querySelector("i").className = "fas fa-user";
      } else {
        authText.textContent = "Login";
        authBtn.href = "/auth/sign-in.html";
        authBtn.classList.remove("logged-in");
        authBtn.querySelector("i").className = "fas fa-user-circle";
      }
    } catch (err) {
      // Not logged in
      authText.textContent = "Login";
      authBtn.href = "/auth/sign-in.html";
      authBtn.classList.remove("logged-in");
      authBtn.querySelector("i").className = "fas fa-user-circle";
    }
  }

  // Update on load
  updateAuthButton();

  // Optional: Re-check on page change (if using SPA navigation)
  window.addEventListener("popstate", updateAuthButton);
});