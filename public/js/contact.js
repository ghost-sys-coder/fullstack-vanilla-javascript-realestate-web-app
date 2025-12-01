const { pathname } = window.location;

if (pathname === "/contact") {
  const contactForm = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.querySelector(".contact-form button");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    statusEl.textContent = "Submitting...";
    statusEl.classList.add("form-status", "submitting");

    const formData = new FormData();

    // get form data
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !phone || !message) {
      statusEl.textContent = "Fields missing!!";
      statusEl.classList.add("success-error");
      return;
    }

    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("message", message);

    // debug the data being sent
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // submit to the backend
    try {
      const response = await axios.post(
        "/api/messages/add",
        {
          name,
          email,
          phone,
          message,
        },
        { headers: "application/json" }
      );

      if (response.status === 201) {
        statusEl.textContent = "Message submitted, please check your email";
        statusEl.classList.add("status-success");
        return;
      }
    } catch (error) {
      console.error("Message submission failed", error);
      statusEl.textContent = "Failed!, Try again!";
      statusEl.classList.add("status-error");
    }
  });
}
