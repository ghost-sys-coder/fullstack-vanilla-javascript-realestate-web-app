const form = document.getElementById("apartment-form");
const statusBox = document.getElementById("status");
const imagesInput = document.getElementById("images");
const previewContainer = document.getElementById("image-preview");

const apartmentRole = document.querySelector("#apartment-form #role");
const rentalPrices = document.querySelector("#apartment-form .display-none");


apartmentRole.addEventListener("change", () => {
  if (apartmentRole.value === "Rent") {
    rentalPrices.classList.remove("display-none");
    rentalPrices.classList.add("card-content");
  } else if (apartmentRole.value === "Sale") {
    rentalPrices.classList.remove("card-content");
    rentalPrices.classList.add("display-none");
  }
})

let selectedFiles = [];

// images handler
const handleImageChange = (files) => {
  // convert FileList to an Array
  const newFiles = Array.from(files);

  // Limit max images to 10
  if (selectedFiles.length + newFiles.length > 10) {
    alert("Maximum images allowed is 10");
    return;
  }

  selectedFiles.push(...newFiles);
  renderPreviews();
};

// Render selected images
const renderPreviews = () => {
  previewContainer.innerHTML = ""; // clear and rebuild

  if (selectedFiles.length === 0) {
    previewContainer.style.display = "none";
    return;
  }

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const wrapper = document.createElement("div");
      const image = document.createElement("img");
      image.src = e.target.result;
      image.alt = `Preview ${index + 1}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.innerHTML = "&times;";
      removeBtn.className = "remove-image-btn";
      removeBtn.onclick = () => removeImage(index);

      wrapper.appendChild(image);
      wrapper.appendChild(removeBtn);
      previewContainer.appendChild(wrapper);
    };

    reader.readAsDataURL(file);
  });
};

// delete image from the preview
const removeImage = (index) => {
  selectedFiles.splice(index, 1);
  renderPreviews();
};

// Event listener
imagesInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleImageChange(e.target.files);
  }
});


// handle the amenities dynamic lists
document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    const list = document.getElementById(targetId);

    const item = document.createElement("div");
    item.className = "dynamic-item";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter name (e.g Makerere University)";
    input.required = true;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-item";
    removeBtn.innerHTML = "x";
    removeBtn.onclick = () => item.remove();

    item.appendChild(input);
    item.appendChild(removeBtn);
    list.appendChild(item);

    // focus the new input
    input.focus();
  });
});


// Collect dynamic list values when submitting
function getDynamicListValues(listId) {
  const inputs = Array.from(document.querySelectorAll(`#${listId} input`));
  const filterInputs = inputs.map(input => input.value.trim()).filter(value => value !== "");
  return filterInputs;
}


//  Handling form data
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "Submitting data...";

  // extra all the form data
  const formData = new FormData(form);


  // organize my data into a clean structure
  const payload = {

    basicInfo: {
      title: formData.get("title")?.trim(),
      price: Number(formData.get("price")),
      location: formData.get("location")?.trim(),
      description: formData.get("description")?.trim() || null,
    },

    propertyDetails: {
      area: formData.get("area")?.trim(),
      bedroom: Number(formData.get("bedroom")),
      bathroom: Number(formData.get("bathroom")),
      floor: formData.get("floor")?.trim(),
      parking: formData.get("parking") === "Yes",
      wifi: formData.get("wifi") === "Yes",
      year: formData.get("year") || null,
      role: formData.get("role") === "Sale",
      rentalPrice: formData.get("rental-price") || null
    },

    amenities: {
      education: getDynamicListValues("education-list"),
      health: getDynamicListValues("health-list"),
      restaurants: getDynamicListValues("restaurants-list"),
      culture: getDynamicListValues("culture-list"),
    },
    };
    
    // jsonify data without the images
    const submitData = new FormData();
    submitData.append("data", JSON.stringify(payload));

    selectedFiles.forEach((file) => {
        submitData.append("images", file);
    });

    // Debug the data being sent

    // for (let [key, value] of submitData.entries()) {
    //     console.log(key, value);
    // }

  // send data to the backend
  try {
      const response = await axios.post("/api/apartments/add", submitData, {
        headers: { "Content-Type": "multipart/form-data"}
      });
      
      if (response.status === 201) {
          statusBox.textContent = "Apartment saved Successfully!!";
          statusBox.style.color = "green";
          form.reset();
          selectedFiles = [];
          renderPreviews();

          // re-route to apartment
          window.location.href = `/apartments/view.html?id=${response.data?.apartment?.id}`
      }
  } catch (error) {
    console.error("Something went wrong!", error);
    const msg = error.response?.data?.message || "Something went wrong!";
    statusBox.textContent = `Error: ${msg}`;
  }
});
