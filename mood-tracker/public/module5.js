let fears = []; // Array of fear objects: { text: string, rating: number|null }
let selectedFear = null;
let exposureSteps = []; // Array to store exposure ladder steps

// Slide 1: Add fear scenarios
function addFear() {
    const fearInput = document.getElementById("fear-input");
    const fearText = fearInput.value.trim();
    if (!fearText) {
        alert("Please enter a fear scenario.");
        return;
    }
    fears.push({ text: fearText, rating: null });
    fearInput.value = "";
    renderFearList();
}

function renderFearList() {
    const listContainer = document.getElementById("fear-list");
    listContainer.innerHTML = "";
    fears.forEach((fear, index) => {
        const div = document.createElement("div");
        div.className = "fear-item";
        div.innerText = fear.text;
        listContainer.appendChild(div);
    });
}

// Slide 2: Render rating controls
function renderRatingControls() {
    const ratingContainer = document.getElementById("rating-container");
    ratingContainer.innerHTML = "";
    fears.forEach((fear, index) => {
        const div = document.createElement("div");
        div.className = "fear-item";
        div.innerHTML = `
            <span>${fear.text}</span><br>
            <label for="slider-${index}">Fear Level: <span id="level-${index}">${fear.rating !== null ? fear.rating : 5}</span></label>
            <input type="range" id="slider-${index}" class="slider" min="1" max="10" value="${fear.rating !== null ? fear.rating : 5}" onchange="updateRating(${index}, this.value)">
        `;
        ratingContainer.appendChild(div);
    });
}

function updateRating(index, value) {
    fears[index].rating = Number(value);
    document.getElementById(`level-${index}`).innerText = value;
    const parent = document.getElementById(`slider-${index}`).parentElement;
    if (value <= 3) {
        parent.style.backgroundColor = "#d4edda"; // light green
    } else if (value <= 7) {
        parent.style.backgroundColor = "#fff3cd"; // light yellow
    } else {
        parent.style.backgroundColor = "#f8d7da"; // light red
    }
}

// Function to sort fears by rating (highest first) and display them for selection
function sortFears() {
    const sorted = [...fears].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const sortedContainer = document.getElementById("sorted-fear-selection");
    sortedContainer.innerHTML = "<h4>Sorted Fears (Most to Least)</h4>";
    sorted.forEach((fear, index) => {
        const div = document.createElement("div");
        div.className = "fear-item";
        div.style.cursor = "pointer";
        div.style.backgroundColor = (fear.rating <= 3) ? "#d4edda" : (fear.rating <= 7) ? "#fff3cd" : "#f8d7da";
        div.innerText = `${fear.text} (Rating: ${fear.rating})`;
        div.onclick = () => { selectFear(fear); };
        sortedContainer.appendChild(div);
    });

}

// Function to set the selected fear
function selectFear(fear) {
    selectedFear = fear;
    document.getElementById("selected-fear").innerText = `Selected Fear: ${fear.text} (Rating: ${fear.rating})`;
    updateReviewSection();
}

// Slide 3: Exposure Ladder functions
function addExposureStep() {
    const container = document.getElementById("exposure-ladder-container");
    const div = document.createElement("div");
    div.className = "exposure-step";
    div.innerHTML = `<input type="text" class="form-control exposure-step-input" placeholder="Exposure Step">`;
    container.appendChild(div);
    updateExposureSteps();
}

function updateExposureSteps() {
    const inputs = document.querySelectorAll(".exposure-step-input");
    exposureSteps = Array.from(inputs).map(input => input.value.trim()).filter(text => text.length > 0);
    updateReviewSection();
}

// Update review section on slide 4
function updateReviewSection() {
    const review = document.getElementById("review-section");
    review.innerHTML = "";
    if (selectedFear) {
        review.innerHTML += `<p><strong>Selected Fear:</strong> ${selectedFear.text} (Rating: ${selectedFear.rating})</p>`;
    }
    if (exposureSteps.length > 0) {
        review.innerHTML += `<p><strong>Exposure Ladder Steps:</strong></p><ol>`;
        exposureSteps.forEach(step => {
            review.innerHTML += `<li>${step}</li>`;
        });
        review.innerHTML += `</ol>`;
    }
}

// When the carousel slide changes to the rating slide (index 1), render rating controls
document.addEventListener("DOMContentLoaded", () => {
    const module5Carousel = document.getElementById("module5Carousel");
    module5Carousel.addEventListener("slid.bs.carousel", function (event) {
        // If current slide is the rating slide (index 1), render rating controls
        if (event.to === 1) {
            renderRatingControls();
        }
    });
});

// Listen for input changes to update exposure ladder steps
document.addEventListener("input", updateExposureSteps);

// Final: Complete the module by sending data to the server and awarding the badge

/***
 NOTE: Something was broken with the awarding the badge here, so some of these functions are in place
* as a safety net to ensure the module is fully completed. The Badge awarding is instead relevant in the
 * server.js file. Again, it probably was a singular line which was the problem, but at this point
 * this whole project is smoke and mirrors and I haven't grown any less lazy since I wrote the code
 * comments for login.js, which was approx 3 minutes ago I.E one Spiritbox song ago
*
*
* */
async function completeModule() {
    if (fears.length === 0) {
        alert("Please add at least one fear scenario.");
        return;
    }
    if (!selectedFear) {
        alert("Please select a fear from the sorted list to work on.");
        return;
    }
    if (exposureSteps.length === 0) {
        alert("Please add at least one exposure step for the selected fear.");
        return;
    }

    const module5Data = {
        fears: fears,
        selectedFear: selectedFear,
        exposureLadder: exposureSteps,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch("/api/module5data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(module5Data)
        });
        if (response.ok) {
            showBadgeModal();
            window.location.href = "user-profile.html";
        } else {
            throw new Error("Failed to save Module 5 data.");
        }
    } catch (error) {
        console.error("Error completing Module 5:", error);
        alert("Error completing module. Please try again.");
    }
}

// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);
    badgeModal.show();
}