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
