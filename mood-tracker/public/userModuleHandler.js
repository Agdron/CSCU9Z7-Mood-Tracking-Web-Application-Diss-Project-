document.addEventListener("DOMContentLoaded", () => {
    // Initialize the carousel
    const carouselElement = document.getElementById("cbtCarousel");
    const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
    const submitButtons = document.querySelectorAll(".module-submit-btn");
    submitButtons.forEach(button => {
        // For each slide, enable the button if at least one checkbox is checked
        const slide = button.closest(".carousel-item");
        if (slide) {
            const checkboxes = slide.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(cb => {
                cb.addEventListener("change", () => {
                    // Enable the button if any checkbox in the slide is checked
                    button.disabled = !Array.from(checkboxes).some(c => c.checked);
                });
            });
        }

        // Attach click event listener for submission
        button.addEventListener("click", async (event) => {
            // Get section identifier from data attribute
            const section = button.getAttribute("data-section");
            if (!section) {
                alert("Section identifier missing.");
                return;
            }

            // Find the parent carousel slide
            const slide = button.closest(".carousel-item");
            if (!slide) {
                alert("Could not find the slide container.");
                return;
            }

            const selectedThoughts = Array.from(slide.querySelectorAll('input[name="thoughts"]:checked')).map(cb => cb.value);
            const selectedEmotions = Array.from(slide.querySelectorAll('input[name="emotions"]:checked')).map(cb => cb.value);
            const selectedPhysical = Array.from(slide.querySelectorAll('input[name="physical symptoms"]:checked')).map(cb => cb.value);
            const selectedBehaviours = Array.from(slide.querySelectorAll('input[name="behaviours"]:checked')).map(cb => cb.value);

            const moduleData = {
                section: section,
                thoughts: selectedThoughts,
                emotions: selectedEmotions,
                physical: selectedPhysical,
                behaviours: selectedBehaviours,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch("http://localhost:3000/api/module1data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(moduleData)
                });
                if (!response.ok) {
                    throw new Error("Failed to submit module data.");
                }
                alert("Your selections have been submitted successfully.");

                if (button.classList.contains("next-btn")) {
                    carousel.next();
                } else if (button.classList.contains("finish-btn")) {
                    document.getElementById("completionMessage").style.display = "block";
                    awardBadge({
                        module: "Module 1",
                        badgeImage: "media/badgeMod1.png",
                        tooltip: "Badge for completing Module 1: Understanding Depression"
                    });
                }
            } catch (error) {
                console.error("Error submitting module data:", error);
                alert("Error: Unable to submit your selections.");
            }
        });
    });
});

// Award badge function for Module 1
function awardBadge(badgeObj) {
    fetch("http://localhost:3000/api/profile")
        .then(response => response.json())
        .then(profile => {
            if (!profile.badges || !Array.isArray(profile.badges)) {
                profile.badges = [];
            }
            const alreadyAwarded = profile.badges.some(b => b.badgeImage === badgeObj.badgeImage);
            if (!alreadyAwarded) {
                profile.badges.push(badgeObj);
                return fetch("http://localhost:3000/api/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profile)
                });
            } else {
                console.log("Module 1 badge already awarded.");
            }
        })
        .then(() => {
            showBadgeModal();
        })
        .catch(err => console.error("Error awarding Module 1 badge:", err));
}
// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);
    badgeModal.show();
}