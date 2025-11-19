const form = document.getElementById("apartment-form");
const statusBox = document.getElementById("status");
const imagesInput = document.getElementById("images");
const previewContainer = document.getElementById("image-preview");

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
}

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
        }

        reader.readAsDataURL(file);
    })

}

// delete image from the preview
const removeImage = (index) => {
    selectedFiles.splice(index, 1);
    renderPreviews();
}

// Event listener
imagesInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handleImageChange(e.target.files);
    }
});


//  Handling form data
form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusBox.textContent = "Submitting data...";

    const formData = new FormData(form);

    console.log(formData);
})
