import locationsData from "../data/properties.js";

const propertiesGrid = document.getElementById("apartments-grid");
const sampleApartmentsSkeleton = document.getElementById("sample-apartments");

async function renderApartments() {
  try {
    const response = await axios.get("/api/apartments", {
      withCredentials: true,
    });
    sampleApartmentsSkeleton.style.display = "none";
    propertiesGrid.style.display = "grid";

    const properties = (await response.data?.apartments) || [];

    if (properties.length === 0) {
      propertiesGrid.innerHTML = "<p>No properties Found!</p>";
    }

    properties?.map((property) => {
      const details = property?.details || {};
      const role = details?.role === true;
      const isRole = !role;

      const singleProperty = document.createElement("a");
      singleProperty.href = `/apartments/view?id=${property.id}`;

      singleProperty.innerHTML = `
    <div class="apartment-card">
    
    <div class="badge ${role === true ? "sale" : "rent"}">
        ${role === true ? "For sale" : "For rent"}
    </div>
    <img src=${property.images[0]} alt=${property.title} class="property-image">
    <div class="apartment-info">
        <h3>${property.title}</h3>
        <p>${property.location}</p>
        <h4>UGX ${Number(property.price.toLocaleString())}</h4>
        <div class="features">
            <div class="feature">
                <div class="">
                <i class="fa fa-bed"></i>
                <span>${details.bedroom}</span>
                </div>
                <span class="feature-text">Beds</span>
            </div>
            <div class="feature">
                <div class="">
                    <i class="fa fa-bath"></i>
                    <span>${details.bathroom}</span>
                </div>
                <span class="feature-text">Bathrooms</span>
            </div>
            <div class="feature">
                <div class="">
                    <i class="fa fa-ruler-combined"></i>
                    <span>${details.area}</span>
                </div>
                <span class="feature-text">Sqft</span>
            </div>
        </div>
    </div>
    </div>
        `;

      propertiesGrid.appendChild(singleProperty);
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    propertiesGrid.innerHTML = "<p>Failed to fetch properties. Try again!</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderApartments());

// Rendering commercial apartments
const commercialApartmentsGrid = document.getElementById(
  "commercial-apartments_grid"
);
const commercialGridSkeleton = document.getElementById(
  "commercial-grid_skeleton"
);

const renderCommercialApartments = async () => {
  try {
    const response = await axios.get(
      `/api/apartments?role=${true}`
    );

    commercialGridSkeleton.style.display = "none";
    commercialApartmentsGrid.style.display = "grid";

    const apartments = (await response.data?.apartments) || [];

    if (apartments?.length === 0) {
      commercialApartmentsGrid.innerHTML = "<p>No properties found!</p>";
      return;
    }

    apartments?.map((property) => {
      const details = property?.details || {};
      const role = details?.role === true;
      const isRole = !role;

      const singleProperty = document.createElement("a");
      singleProperty.href = `/apartments/view?id=${property.id}`;

      singleProperty.innerHTML = `
        <div class="apartment-card">
            <div class="badge ${
              role === true ? "sale" : "rent"
            }">
            ${role === true ? "For Sale" : "For Rent"}
            </div>
            <img src=${property.images[0]} alt=${property.title} />
            <div class="text-content">
                <div class="title-price">
                    <h5>${property.title}</h5>
                    <p>UGX ${Number(property.price).toLocaleString()}</p>
                </div>
               <div class="amenities">
                    <div class="">
                       <i class="fa fa-bed"></i>
                       <span>${details.bedroom}</span>
                    </div>
                    <div class="">
                        <i class="fa fa-bath"></i>
                        <span>${details.bathroom}</span>
                    </div>
                    <div class="">
                        <i class="fa fa-ruler-combined"></i>
                        <span>${details.area}</span>
                    </div>
                </div>
            </div>
          </div> 
      `;
      commercialApartmentsGrid.appendChild(singleProperty);
    });
  } catch (error) {
    console.error("Something went wrong! Try again", error);
  }
};

document.addEventListener("DOMContentLoaded", renderCommercialApartments());

// render the location grid
const locationsGrid = document.getElementById("locations-grid");
const locationSkeletonGrid = document.getElementById("location_skeleton-grid");

async function renderLocationsGrid() {
  try {
    const response = await axios.get("/api/apartments/locations/list", {
      withCredentials: true
    });

    const locations = await response.data?.locations;

    locationSkeletonGrid.style.display = "none";
    locationsGrid.style.display = "grid";
    
    locations?.map((location) => {
      const locationCard = document.createElement("div");
      locationCard.classList.add("location-card");
      locationCard.innerHTML = `
        <img src=${location.image} alt={location.name}>
        <div class="overlay"></div>
        <div class="location-info">
          <p>${location.name}</p>
        <span>
          ${location.location_count}
          ${location.location_count > 1 ? "Properties" : "Property"}
        </span>
        </div>
      `;
      locationsGrid.appendChild(locationCard);
    })
  } catch (error) {
    console.error("Failed to fetch locations:", error);
  }
}

document.addEventListener("DOMContentLoaded", renderLocationsGrid());
