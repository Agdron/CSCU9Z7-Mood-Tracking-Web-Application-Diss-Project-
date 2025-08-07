document.addEventListener("DOMContentLoaded", () => {
    const goalData = {};

    const attachSuggestionHandlers = (inputId, suggestionContainerId) => {
        const input = document.getElementById(inputId);
        const container = document.getElementById(suggestionContainerId);
        if (container) {
            container.querySelectorAll(".suggestion-item").forEach(item => {
                item.addEventListener("click", () => {
                    input.value = item.textContent;
                    goalData[inputId] = input.value.trim();
                });
            });
        }
    };

    attachSuggestionHandlers("specific", "specific-suggestions");
    attachSuggestionHandlers("measurable", "measurable-suggestions");
    attachSuggestionHandlers("achievable", "achievable-suggestions");
    attachSuggestionHandlers("relevant", "relevant-suggestions");
    attachSuggestionHandlers("timebound", "timebound-suggestions");

    ["specific", "measurable", "achievable", "relevant", "timebound"].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener("blur", () => {
            goalData[fieldId] = document.getElementById(fieldId).value.trim();
            if (fieldId === "timebound") {
                updatePreview();
            }
        });
    });

    window.saveInput = (fieldId) => {
        const input = document.getElementById(fieldId);
        goalData[fieldId] = input.value.trim();
        if (fieldId === "timebound") {
            updatePreview();
        }
    };

    const updatePreview = () => {
        const previewElement = document.getElementById("goal-preview");
        const specific = goalData.specific || "";
        const measurable = goalData.measurable || "";
        const achievable = goalData.achievable || "";
        const relevant = goalData.relevant || "";
        const timebound = goalData.timebound || "";
        const previewText = `My SMART goal: I will ${specific} in a way that is measurable by ${measurable}, achievable by ${achievable}, relevant because ${relevant}, and I aim to accomplish it within ${timebound}.`;
        previewElement.textContent = previewText;
    };

    document.getElementById("submit-goal").addEventListener("click", async () => {
        const requiredFields = ["specific", "measurable", "achievable", "relevant", "timebound"];
        for (const field of requiredFields) {
            if (!goalData[field] || goalData[field].length === 0) {
                alert("Please complete all fields of your SMART goal.");
                return;
            }
        }
        goalData.timestamp = new Date().toISOString();
        console.log("Submitting SMART Goal Data:", goalData);

        try {
            const response = await fetch("http://localhost:3000/api/module3data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(goalData)
            });
            if (!response.ok) {
                console.error("Server responded with status:", response.status);
                throw new Error("Failed to submit SMART goal");
            }
            alert("Your SMART goal has been submitted successfully.");
            const carouselElement = document.getElementById("goalCarousel");
            const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
            carousel.to(7);
            // Award Module 3 badge after successful submission
            awardBadge({
                module: "Module 3",
                badgeImage: "media/badgeMod3.png",
                tooltip: "Badge for completing Module 3: SMART Goals Module"
            });
        } catch (error) {
            console.error("Error submitting SMART goal:", error);
            alert("Error submitting your goal. Please try again.");
        }
    });
});

// Award badge function for Module 3
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
                console.log("Module 3 badge already awarded.");
            }
        })
        .then(() => {
            showBadgeModal();
        })
        .catch(err => console.error("Error awarding Module 3 badge:", err));
}
// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);
    badgeModal.show();
}