//get path to the footer
const footerPath = currentPage.includes("/admin") ? "../../components/footer.html" : "/components/footer.html";

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