// get the current page
const currentPage = window.location.pathname;

// get the current user role
let currentUserRole = null;
let currentUser = null;

// get path to navbar component
const navbarPath = currentPage.includes("/admin") ? "../../components/navbar.html" : "/components/navbar.html"

// fetch user information
async function fetchUserRole() {
  try {
    const response = await axios.get("/api/auth/me", {
      withCredentials: true,
    });
    currentUserRole = response.data.user?.role;
    currentUser = response.data.user;
  } catch (error) {
    console.error("Failed to retrieve user!");
  }
}

// logout current user
const handleLogoutUser = async () => {
  try {
    const response = await axios.post("/api/auth/sign-out", { withCredentials: true });
    if (response.data.success) {
      window.location.href = "/auth/sign-in.html"
    }
  } catch (error) {
    console.error("Failed to logout", error);
    window.location.href = "/auth/sign-in";
  }
}

// fetch and load navbar
async function loadNavbar() {
  await fetchUserRole();

  fetch(navbarPath)
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;

      const navigationContainer = document.getElementById("navbar-container");

      const menu = document.getElementById("menu");
      const closeMenu = document.getElementById("closeMenu");
      const linksContainer = document.getElementById("nav-links");

      // inject an admin link
      if (currentUserRole === "admin") {
        const adminLink = document.createElement("a");
        adminLink.href = "/admin/create-apartment";
        adminLink.textContent = "Add New";
        adminLink.classList.add("nav-link");

        linksContainer.appendChild(adminLink);
      }

      // highlight the active link
      const menuLinks = document.querySelectorAll(".nav-links a");

      menuLinks.forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
        }
      });

      // This piece of code is failing to work
      // from here
      if (currentUser) {
        const logoutContainer = document.createElement("div");
        logoutContainer.className = "logout";
        const logoutBtn = document.createElement("button");
        logoutBtn.type = "button";
        logoutBtn.id = "logout-btn";
        logoutBtn.innerHTML = `
          <span>Logout</span>
          <i class="fa fa-sign-out"></i>
        `;
        logoutBtn.addEventListener("click", handleLogoutUser);

        logoutContainer.appendChild(logoutBtn);
        navigationContainer.appendChild(logoutContainer);
      }
      // it ends here -- check it

      // responsive navigation bar logic
      menu.addEventListener("click", () => {
        linksContainer.classList.add("open");
        menu.style.display = "none";
        closeMenu.style.display = "block";
      });

      closeMenu.addEventListener("click", () => {
        linksContainer.classList.remove("open");
        closeMenu.style.display = "none";
        menu.style.display = "block";
      });
    });
}

loadNavbar();