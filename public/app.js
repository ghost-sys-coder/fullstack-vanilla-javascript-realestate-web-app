// get the current page
const currentPage = window.location.pathname;

// get the current user role
let currentUserRole = null;

// get path to navbar component
const navbarPath = currentPage.includes("/admin") ? "../../components/navbar.html" : "components/navbar.html"

const footerPath = currentPage.includes("/admin") ? "../../components/footer.html" : "components/footer.html";

async function fetchUserRole() {
  try {
    const response = await axios.get("/api/auth/me", {
      withCredentials: true,
    });
    currentUserRole = response.data.user?.role;
  } catch (error) {
    console.error("Failed to retrieve user!");
  }
}

// fetch and load navbar
async function loadNavbar() {
  await fetchUserRole();

  fetch(navbarPath)
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;

      const menu = document.getElementById("menu");
      const closeMenu = document.getElementById("closeMenu");
      const linksContainer = document.getElementById("nav-links");

      // inject an admin link
      if (currentUserRole === "admin") {
        console.log({ currentUserRole });
        const adminLink = document.createElement("a");
        adminLink.href = "/admin/create/apartment.html";
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

// fetch and load footer
fetch(footerPath)
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;

    const footerLinks = document.querySelectorAll("footer a");

    footerLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active-footer-link");
      }
    });
  });

// Home page contact form handling
const contactForm = document.getElementById("contact-form");
const submitBtn = contactForm.querySelector("#submit-btn");
const formStatus = contactForm.querySelector(".form-status");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formStatus.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  //call the backend API

  try {
    const payload = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      phone: contactForm.phone.value,
      message: contactForm.message.value,
    };

    const response = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
  } catch (error) {
    console.log("Something went wrong! Try again!", error);
    formStatus.textContent = "Something went wrong. Please try again!";
    formStatus.style.color = "#ef4444";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
