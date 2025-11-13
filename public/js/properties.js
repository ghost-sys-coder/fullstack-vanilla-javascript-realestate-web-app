import properties from "../data/properties.js";

const propertiesGrid = document.getElementById("apartments-grid");

function renderApartments (){
    propertiesGrid.innerHTML = properties.map((property) => `
    <div class="apartment-card">
    
    <div class="badge ${property.status === "for sale" ? "sale" : "rent"}">
        ${property.status === "for sale" ? "For sale" : "For rent"}
    </div>
    <img src=${property.images[0]} alt=${property.title} class="property-image">
    <div class="apartment-info">
        <h3>${property.title}</h3>
        <p>${property.address}</p>
        <h4>$ ${property.price.toLocaleString()}</h4>
        <div class="features">
            <div class="feature">
                <div class="">
                <i class="fa fa-bed"></i>
                <span>${property.bedrooms}</span>
                </div>
                <span class="feature-text">Beds</span>
            </div>
            <div class="feature">
                <div class="">
                    <i class="fa fa-bath"></i>
                    <span>${property.bathrooms}</span>
                </div>
                <span class="feature-text">Bathrooms</span>
            </div>
            <div class="feature">
                <div class="">
                    <i class="fa fa-ruler-combined"></i>
                    <span>${property.area}</span>
                </div>
                <span class="feature-text">Sqft</span>
            </div>
            <div class="feature">
                <div class="">
                <i class="fa fa-car"></i>
                <span>${property.garages}</span>
                </div>
                <span class="feature-text">Garages</span>
            </div>
        </div>
    </div>
    </div>
    `).join("");
}


renderApartments();



// Rendering commercial apartments
const commercialApartmentsGrid = document.getElementById("commercial-apartments_grid");

const renderCommercialApartments = ()=> {
    const commercialProperties = properties.filter(property => property.commercial === true);

    commercialApartmentsGrid.innerHTML = commercialProperties.map(property => `
        <div class="apartment-card">
            <div class="badge ${property.status === "for sale" ? "sale" : "rent"}">
            ${property.status === "for sale" ? "For Sale" : "For Rent"}
            </div>
            <img src=${property.images[0]} alt=${property.title} />
            <div class="text-content">
                <div class="title-price">
                    <h5>${property.title}</h5>
                    <p>$ ${property.price}</p>
                </div>
               <div class="amenities">
                    <div class="">
                       <i class="fa fa-bed"></i>
                       <span>${property.bedrooms}</span>
                    </div>
                    <div class="">
                        <i class="fa fa-bath"></i>
                        <span>${property.bathrooms}</span>
                    </div>
                    <div class="">
                        <i class="fa fa-ruler-combined"></i>
                        <span>${property.area}</span>
                    </div>
                    <div class="">
                        <i class="fa fa-car"></i>
                        <span>${property.garages}</span>
                    </div>
                </div>
            </div>
        </div> 
    `).join("");
}

renderCommercialApartments();



// render the location grid
const locationsGrid = document.getElementById("locations-grid");

function renderLocationsGrid(){
    // get unique property locations
    const uniqueLocations = [...new Set(properties.map(property => property.location))];

    // Properties that belong to each unique location
    const locationData = uniqueLocations.map(location => {
        const locationProperties = properties.filter((property) => property.location === location );

        console.log(locationProperties);

        return {
            name: location,
            count: locationProperties.length,
            image: locationProperties[0].images[0]
        }
    });

   locationsGrid.innerHTML = locationData.map(location => `
   <div class="location-card">
      <img src=${location.image} alt={location.name}>
      <div class="overlay"></div>
      <div class="location-info">
        <p>${location.name}</p>
       <span>
        ${location.count}
        ${location.count > 1 ? "Properties" : "Property"}
       </span>
      </div>
    </div>
   `).join("");
}

renderLocationsGrid();