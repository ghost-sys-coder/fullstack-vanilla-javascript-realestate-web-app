document.addEventListener("DOMContentLoaded", async () => {
  const propertiesContainer = document.getElementById("properties-container");

  const skeletonLoader = document.getElementById(
    "properties-container_skeleton"
  );

  // map property details
  const iconMap = {
    bedroom: { icon: "fa-bed", label: "Bedrooms" },
    bathroom: { icon: "fa-bath", label: "Bathrooms" },
    area: { icon: "fa-ruler-combined", label: "Area", suffix: "sq ft" },
  };

  // fetch properties
  try {
    const response = await axios.get("/api/apartments", {
      withCredentials: true,
    });
    skeletonLoader.style.display = "none";
    propertiesContainer.style.display = "grid";

    const properties = (await response.data?.apartments) || [];

    if (properties.length === 0) {
      propertiesContainer.innerHTML = "<p>No properties Found!!</p>";
      return;
    }

    properties?.map((property) => {
      const details = property?.details || {};
      const role = details.role === true;
      const isRent = !role;

      const singleProperty = document.createElement("a");
      singleProperty.href = `/apartments/view?id=${property.id}`;
      singleProperty.classList.add("property-item");

      // Build details with icons
      let detailsHTML = "";

      Object.keys(iconMap).forEach((key) => {
        const value = details[key];
        if (value === undefined || value === null || value === "") return;

        detailsHTML += `
            <div class="detail-item">
                <div class="">
                <i class="fa ${iconMap[key].icon}"></i>
                <span>${value}</span>
                </div>
                <p>${iconMap[key].label}</p>
            </div>
          `;
      });

      singleProperty.innerHTML = `
                <div class="image">
                    <img src=${property?.images[0]} alt=${property.title} />
                    <p class=${role === true ? "for-sale" : "for-rent"}>${
        role === true ? "For Sale" : "For Rent"
      }</p>
                </div>
                <div class="content">
                    <h2>${property.title}</h2>
                    <p class="desc">${property.description.substring(
                      0,
                      100
                    )}</p>
                    <p class="price">UGX${Number(
                      property.price
                    ).toLocaleString()}</p>
                    <div class="details-grid">
                        ${detailsHTML}
                    </div>
                </div>
            `;
      propertiesContainer.appendChild(singleProperty);
    });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
  }
});
