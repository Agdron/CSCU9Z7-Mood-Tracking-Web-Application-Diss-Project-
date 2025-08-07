document.addEventListener("DOMContentLoaded", () => {
    // Initialize drag‐and‐drop for puzzle slides (excluding the custom slide)
    const puzzleSlides = document.querySelectorAll(".carousel-item[data-section]:not([data-section='custom'])");
    puzzleSlides.forEach(slide => {
        initializePuzzle(slide);
    });

    const customSlide = document.querySelector(".carousel-item[data-section='custom']");
    if (customSlide) {
        const finishBtn = customSlide.querySelector("#module2-submit");
        const textarea = customSlide.querySelector("#module2-input");
        // Enable finish button when text is entered
        textarea.addEventListener("input", () => {
            finishBtn.disabled = textarea.value.trim() === "";
        });
        finishBtn.addEventListener("click", async () => {
            const text = textarea.value.trim();
            if (!text) {
                alert("Please enter your ABC scenario.");
                return;
            }
            try {
                const response = await fetch("http://localhost:3000/api/module2data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reflection: text })
                });
                if (!response.ok) {
                    throw new Error("Submission failed.");
                }
                alert("Your custom ABC scenario has been submitted successfully.");
                // Optionally clear the text and advance the carousel
                textarea.value = "";
                const carouselElement = document.getElementById("abcCarousel");
                const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
                carousel.next();
                // Award Module 2 badge after successful submission
                awardBadge({
                    module: "Module 2",
                    badgeImage: "media/badgeMod2.png",
                    tooltip: "Badge for completing Module 2: ABC Matching Module"
                });
            } catch (error) {
                console.error("Error submitting ABC scenario:", error);
                alert("Error submitting your scenario.");
            }
        });
    }
});

function initializePuzzle(slide) {
    const originalContainer = slide.querySelector("[id^='draggables-container']");
    if (!originalContainer) return;
    const draggables = slide.querySelectorAll(".draggable-item");
    draggables.forEach(item => {
        item.dataset.originalContainer = originalContainer.id;
        item.setAttribute("draggable", "true");
        item.addEventListener("dragstart", handleDragStart);
        item.addEventListener("dragend", handleDragEnd);
    });
    const dropZones = slide.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => {
        zone.addEventListener("dragover", handleDragOver);
        zone.addEventListener("drop", handleDrop);
    });
    const submitBtn = slide.querySelector(".submit-puzzle-btn");
    if (submitBtn) {
        slide.addEventListener("puzzleUpdated", () => {
            let allPlaced = true;
            draggables.forEach(item => {
                if (!item.parentElement.classList.contains("drop-zone")) {
                    allPlaced = false;
                }
            });
            submitBtn.disabled = !allPlaced;
        });
        submitBtn.addEventListener("click", () => {
            if (validatePuzzle(slide)) {
                alert("Correct! Moving to the next puzzle.");
                const carouselElement = document.getElementById("abcCarousel");
                const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
                carousel.next();
            } else {
                alert("Incorrect. Please try again.");
                resetPuzzle(slide);
            }
        });
    }
}

function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.textContent);
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
}

function handleDragEnd(e) {
    e.target.classList.remove("dragging");
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
    e.preventDefault();
    const draggedItem = document.querySelector(".draggable-item.dragging");
    if (!draggedItem) return;
    if (!e.currentTarget.querySelector(".draggable-item")) {
        e.currentTarget.appendChild(draggedItem);
        const slide = e.currentTarget.closest(".carousel-item");
        if (slide) {
            slide.dispatchEvent(new Event("puzzleUpdated"));
        }
    }
}

function validatePuzzle(slide) {
    let valid = true;
    const dropZones = slide.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => {
        const expectedCategory = zone.getAttribute("data-category").toLowerCase();
        const droppedItem = zone.querySelector(".draggable-item");
        if (!droppedItem) {
            valid = false;
        } else {
            const itemCategory = droppedItem.getAttribute("data-correct").toLowerCase();
            if (itemCategory !== expectedCategory) {
                valid = false;
            }
        }
    });
    return valid;
}

function resetPuzzle(slide) {
    const dropZones = slide.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => {
        const droppedItem = zone.querySelector(".draggable-item");
        if (droppedItem) {
            const originalContainerId = droppedItem.dataset.originalContainer;
            const originalContainer = slide.querySelector(`#${originalContainerId}`);
            if (originalContainer) {
                originalContainer.appendChild(droppedItem);
            }
        }
    });
    slide.dispatchEvent(new Event("puzzleUpdated"));
}

// Award badge function for Module 2
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
                console.log("Module 2 badge already awarded.");
            }
        })
        .then(() => {
            showBadgeModal();
        })
        .catch(err => console.error("Error awarding Module 2 badge:", err));
}

// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);

    badgeModal.show();
}