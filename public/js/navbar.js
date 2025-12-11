// get the current page
const currentPage = window.location.pathname;

// get the current user role
let currentUserRole = null;
let currentUser = null;

const navbarEl = document.getElementById("navbar");
const skeletonPlaceholder = document.getElementById("skeleton-placeholder");

// get path to navbar component
const navbarPath = currentPage.includes("/admin")
  ? "../../components/navbar.html"
  : "/components/navbar.html";

const navbarSkeletonPath = currentPage.includes("/admin")
  ? "../../components/navbar-skeleton.html"
  : "/components/navbar-skeleton.html";

// instantly load navbar skeleton
fetch(navbarSkeletonPath)
  .then((res) => res.text())
  .then((html) => {
    skeletonPlaceholder.innerHTML = html;
  })
  .catch(() => {
    skeletonPlaceholder.innerHTML = `
      <div class="container">
        Loading navigation
      </div>
    `;
  });


// fetch user information
async function fetchUserRole() {
  try {
    const response = await axios.get("/api/auth/me", {
      withCredentials: true,
    });

    currentUserRole = await response.data.user?.role;
    currentUser = await response.data.user;

    // this line below is not working
    if (currentPage.includes("/admin") && currentUserRole !== "admin") {
      return window.location.href = "/auth/sign-in.html"
    }
    
  } catch (error) {
    console.error("Failed to retrieve user!", error);
    if (error.status === 404 && currentPage.includes("/admin")) {
      return window.location.href = "/auth/sign-in.html";
    }
  }
}

// logout current user
const handleLogoutUser = async () => {
  try {
    const response = await axios.post("/api/auth/sign-out", {
      withCredentials: true,
    });
    if (response.data.success) {
      window.location.href = "/auth/sign-in.html";
    }
  } catch (error) {
    console.error("Failed to logout", error);
    window.location.href = "/auth/sign-in";
  }
};

// fetch and load navbar
async function loadNavbar() {
  try {
    await fetchUserRole();

    const response = await fetch(navbarPath);
    const html = await response.text();

    // Replace skeleton with the real navbar
    navbarEl.innerHTML = html;

    const container = document.getElementById("navbar-container");
    const linksContainer = document.getElementById("nav-links");
    const menu = document.getElementById("menu");
    const closeMenu = document.getElementById("closeMenu");

    //Add Admin Link
    if (currentUserRole === "admin") {
      const adminLink = document.createElement("a");
      adminLink.href = "/admin/create-apartment";
      adminLink.textContent = "Add New";
      adminLink.classList.add("nav-link");
      linksContainer.appendChild(adminLink);
    }

    //Highlight active link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });

    // Add logout button if logged in
    const logoutDiv = document.createElement("div");
    logoutDiv.classList.add("logout");
    const logoutBtn = document.createElement("button");

    if (currentUser) {
      logoutBtn.id = "logout-btn";
      logoutBtn.innerHTML = `
        <span>Logout</span>
        <i className="fa fa-sign-out"></i>
      `;
      logoutBtn.addEventListener("click", handleLogoutUser);

      logoutDiv.appendChild(logoutBtn);
      container.appendChild(logoutDiv);
    } else {
      logoutBtn.id = "sign-in";
      logoutBtn.classList.add("sign-in");
      logoutBtn.innerHTML = `
        <a href="/auth/sign-in.html">
        <span>Sign In</span>
        <i class="fa fa-sign-in"></i>
        </a>
      `;
      logoutDiv.appendChild(logoutBtn);
      container.appendChild(logoutDiv);
    }

    // Mobile Menu toggle
    if (menu && closeMenu && linksContainer) {
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
    }

    // load the about page components
    if (currentPage === "/about" && currentUserRole === "admin") {
      const agentsBtnContainer = document.getElementById("agents-header");
      const btnLink = document.createElement("a");
      btnLink.href = "/admin/create-agent";
      btnLink.classList.add("cta-btn");
      btnLink.innerHTML = `
    <span>Add Agent</span>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
  `;
      agentsBtnContainer.appendChild(btnLink);
    }
  } catch (error) {
    console.error("Failed to load navbar:", error);
    navbarContainer.innerHTML = `
    <div class="container" style="padding: 1rem 2rem; text-align:center; color: #e74c3c;">
      Failed to load navigation
    </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);
