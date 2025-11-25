// Get ID from URL
const params = new URLSearchParams(window.location.search);
const apartmentId = params.get("id");
const skeleton = document.getElementById("skeleton");
const content = document.getElementById("apartment-content");

// load apartment information
async function loadApartment() {
  if (!apartmentId) {
    content.innerHTML = "<h2>Invalid apartment ID</h2>";
    skeleton.style.display = "none";
    return;
  }

  try {
    setTimeout(async () => {
      const response = await axios.get(`/api/apartments/${apartmentId}`);
        const apartment = await response.data.apartment;
        console.log(apartment);
        
        // Hide skeleton, show the content
        skeleton.style.display = "none";
        content.style.display = "block";

        // Now render the content
        renderApartment(apartment);
    }, 3000);
  } catch (error) {
      console.error("Something went wrong,", error);
      skeleton.style.display = "none";
      content.style.display = "block";
      content.innerHTML = `
      <div className="" style="text-align:center; padding:4rem; color:#e74c3c;">
        <h2>Failed to load apartment data</h2>
        <p>Please refresh the page or check your internet connection</p>
      </div>
      `
  }
}

function renderApartment(apartment) {
    const roleEl = document.getElementById("property-role");
    const isForSale = apartment?.details?.role === true;
    roleEl.textContent = isForSale ? "For Sale" : "For Rent";
    roleEl.className = "property-role " + (isForSale ? "role-sale" : "role-rent");

    document.getElementById("apartment-title").innerHTML = `
    <h1>${apartment.title}</h1>
    <p>${apartment.location}</p>
    `
    document.getElementById("apartment-price").innerHTML = `
    <h2>UGX${apartment.price}</h2>
    <span>${apartment?.details?.area}/sq.ft</span>
    `

    // get images
    const largeImageContainer = document.querySelector(".images-grid .large-image");
    const largeImage = largeImageContainer.appendChild(document.createElement("img"));
    largeImage.src = apartment.images[0];
    largeImage.alt = apartment.title;

    const smallImagesContainer = document.querySelector(".images-grid .small-images");
    apartment?.images?.splice(0, 4)?.map((image, index) => {
        const imageContainer = document.createElement("div");
        smallImagesContainer.appendChild(imageContainer); 
        const smallImage = document.createElement("img");
        smallImage.src = image;
        smallImage.alt = image + index;
        smallImage.onclick = () => {
            largeImage.src = image;
        }
        imageContainer.appendChild(smallImage);
    });

    // property description & details
    const descriptionText = document.querySelector(".details .left-container .description .desc-text");
    descriptionText.innerHTML = apartment?.description?.substring(0, 400);


    const propertyDetails = document.querySelector(".property-details_container .property-details");
    propertyDetails.innerHTML = "";

    const detailItems = [
        { key: "area", label: "Total Area", icon: "fa-th-large", suffix: "sq.ft" },
        { key: "bedroom", label: "Bedroom", icon: "fa-bed" },
        { key: "bathroom", label: "Bathroom", icon: "fa-bath" },
        { key: "floor", label: "Floor", icon: "fa-building-o" },
        { key: "year", label: "Construction Year", icon: "fa-calendar" },
        { key: "wifi", label: "Wi-Fi", icon: "fa-wifi", yesNo: true },
        {key: "parking", label: "Garage", icon: "fa-car", yesNo: true}
    ]
    
    detailItems.map((item) => {
        const value = apartment?.details?.[item.key];
        if (value === undefined || value === null || value === "") return;

        const detail = document.createElement("div");
        detail.className = "item";

        const displayValue = item.yesNo ? (value ? "Yes" : "No") : value + (item.suffix || "");

        detail.innerHTML = `
            <div className="details_item">
                <i class="fa ${item.icon}" aria-hidden="true"></i>
                ${item.label}
            </div>
            <span>${displayValue}</span>
        `;
        propertyDetails.appendChild(detail);
    });


    // handling property amenities
    const amenitiesContainer = document.querySelector(".amenities-container");

    const amenityDetails = [
        { key: "education", label: "Education", icon: "fa-graduation-cap" },
        { key: "health", label: "Health & Medicine", icon: "fa-ambulance" },
        { key: "restaurants", label: "Restaurants & Hotels", icon: "fa-bed" },
        {key: "culture", label: "Culture", icon: "fa-gavel"}
    ]

    amenityDetails.map((item) => {
        const value = apartment?.amenities?.[item.key];
        if (value === undefined || value === null || value === "") return;
        
        const detail = document.createElement("div");
        detail.className = "item";

        detail.innerHTML = `
            <div class="item-header">
            <i class="fa ${item.icon}" aria-hidden="true"></i>
            <span>${item.label}</span>
            </div>
            <ul class="item-content">
                ${value.map(v => `<li>${v}</li>`).join("")}
            </ul>
        `;

        amenitiesContainer.appendChild(detail);
    })


    // handling contact form 
    const agentContactDetails = document.querySelector(".contact-form_container .contact-details");
    agentContactDetails.innerHTML = `
        <h5>${apartment.username}</h5>
        <p>${apartment.contact}</p>
        <p>${apartment.email}</p>
    `;

}

loadApartment();
