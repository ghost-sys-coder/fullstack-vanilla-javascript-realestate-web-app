// js/testimonials.js
const testimonials = [
    {
        name: "Mike Samuel",
        role: "Homeowner, Palm Residences",
        image: "/assets/images/testimonials/male_one.png",
        message:
            "DreamHomes made buying my first home so simple and stress-free. The team was incredibly responsive, and I found the perfect apartment within days!",
    },
    {
        name: "Sarah",
        role: "Investor, Skyline Apartments",
        image: "/assets/images/testimonials/female_one.png",
        message:
            "Their platform helped me compare listings easily. I loved how professional and modern the interface felt — it’s a true game-changer for real estate.",
    },
    {
        name: "Francis",
        role: "Tenant, Sunset Villas",
        image: "/assets/images/testimonials/male_two.png",
        message:
            "The experience was amazing! Everything was transparent, from viewing properties to finalizing paperwork. Highly recommend DreamHomes.",
    },
    {
        name: "Annet Nakimuli",
        role: "Landlord, East Park Homes",
        image: "/assets/images/testimonials/female_two.png",
        message:
            "Listing my property was seamless. Within a week, I had multiple interested tenants. DreamHomes truly connects landlords with serious renters.",
    }
];


const testimonialsSection = document.getElementById("testimonials-section");

if(testimonialsSection){
    let currentIndex = 0;

    // Create the HTML Structure
    testimonialsSection.innerHTML = `
    <div class="testimonials-container">
    <div class="testimonial-card">
        <img src=${testimonials[0].image} alt="${testimonials[0].name}" />
        <div class="text-content">
        <h4>What our clients say about us?</h4>
        <p class="message">${testimonials[0].message}</p>
        <h5>${testimonials[0].name}</h5>
        <span>${testimonials[0].role}</span>
    </div>
    </div>
    
    <div class="testimonial-controls">
        <button id="prev"><i class="fa fa-chevron-left"></i></button>
        <button id="next"><i class="fa fa-chevron-right"></i></button>
    </div>
    </div>
    `;

    const card = testimonialsSection.querySelector(".testimonial-card");
    const prevBtn = testimonialsSection.querySelector("#prev");
    const nextBtn = testimonialsSection.querySelector("#next");


    const updateTestimonial = (index) => {
        const t = testimonials[index];
        card.innerHTML = `
        <img src=${t.image} alt=${t.name} />
        <div class="text-content">
            <h4>What our clients say about us?</h4>
            <p class="message">${t.message}</p>
            <h5>${t.name}</h5>
            <span>${t.role}</span>
        </div>
        `
    }

    prevBtn.addEventListener("click", ()=> {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateTestimonial(currentIndex);
    });

    nextBtn.addEventListener("click", ()=> {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateTestimonial(currentIndex);
    })
}