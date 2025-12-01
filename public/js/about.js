const video = document.querySelector(".about_video-section .hero-video");
const playBtn = document.querySelector(".about_video-section .play-btn");

const agentsContainer = document.getElementById("agents");

playBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

// loading agents
// about.js – Updated Agent Cards Rendering
document.addEventListener("DOMContentLoaded", async () => {
  const skeleton = document.getElementById("agents-grid_skeleton");
  const grid = document.getElementById("agents-grid");

  try {
    const { data } = await axios.get("/api/agents");
    const agents = data.agents || [];

    if (agents.length === 0) {
      grid.innerHTML = "<p style='text-align:center; color:#666; grid-column:1/-1;'>No agents found.</p>";
      return;
    }

    skeleton.style.display = "none";
    grid.style.display = "grid";

    agents.forEach(agent => {
      const socialLinks = agent.socials || {};
      const hasSocial = Object.values(socialLinks).some(link => link);

      const card = document.createElement("div");
      card.className = "agent-card";
      card.innerHTML = `
        <div class="agent-photo">
          <img src="${agent.profile_image || '/assets/images/default-agent.jpg'}" 
               alt="${agent.name}" loading="lazy" />
          <div class="agent-overlay">
            <div class="social-icons">
              ${socialLinks.facebook ? `<a href="${socialLinks.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
              ${socialLinks.twitter ? `<a href="${socialLinks.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
              ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
              ${socialLinks.instagram ? `<a href="${socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
              ${!hasSocial ? '<span class="no-social">No social links</span>' : ''}
            </div>
          </div>
        </div>

        <div class="agent-info">
          <h3>${agent.name}</h3>
          <p class="role">${agent.role || 'Real Estate Agent'}</p>
          
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-phone"></i>
              <span>${agent.mobile}</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <span>${agent.email}</span>
            </div>
          </div>

          <button class="contact-btn">
            <i class="fas fa-comment-dots"></i>
            Contact Agent
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load agents:", error);
    grid.innerHTML = "<p style='text-align:center; color:#e74c3c; grid-column:1/-1;'>Failed to load agents.</p>";
  }
});
