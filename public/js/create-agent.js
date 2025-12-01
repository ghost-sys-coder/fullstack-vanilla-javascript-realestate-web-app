// handling the form submission
const form = document.getElementById("agent-form");
const statusEl = document.getElementById("status");
const uploadArea = document.getElementById("upload-area");
const preview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const removeBtn = document.getElementById("remove-image");

let selectedFile = null;

document.getElementById("profile-image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    preview.style.display = "block";

    const placeholder = uploadArea.querySelector(".upload-placeholder");
    placeholder.style.display = "none";
  };

  reader.readAsDataURL(file);
});

removeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  selectedFile = null;

  previewImg.src = "";
  preview.style.display = "none";

  const placeholder = uploadArea.querySelector(".upload-placeholder");
  placeholder.style.display = "block";

  document.getElementById("profile-image").value = "";
});


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Creating Agent...";
    statusEl.className = "status";

    const formData = new FormData();

    if (!selectedFile) {
        statusEl.textContent = "Please upload a profile photo";
        statusEl.className = "status error";
        return;
    }

    formData.append("profile_image", selectedFile);
    formData.append("name", document.getElementById("name").value.trim());
    formData.append("mobile", document.getElementById("mobile").value.trim());
    formData.append("email", document.getElementById("email").value.trim());
    formData.append("role", document.getElementById("role").value.trim());

    // handling social links
    ["facebook", "twitter", "linkedin", "instagram"].map(platform => {
        const value = document.querySelector(`input[name=${platform}]`).value.trim();
        
        if (value) formData.append(platform, value);
    });

    // Debug the data being sent
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
  }
  
  // send to the api
  try {
    const response = await axios.post("/api/agents/add", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (response.status === 201) {
      statusEl.textContent = response?.data?.data?.message || "Agent has been added!";
      statusEl.className = "status success";
    }

    setTimeout(() => {
      window.location.href = "/about#agents"
    }, 2000);
  } catch (error) {
    console.error("Failed to create agent!", error);
    statusEl.textContent = error?.response?.data?.message || "Failed to create agent.";
    statusEl.className = "status error";
  }
})