document.addEventListener("DOMContentLoaded", () => {
    fetchMoodJourney();
});

// Global variable to store all mood entries
let allMoodEntries = [];

async function fetchMoodJourney() {
    try {
        const response = await fetch("http://localhost:3000/api/moods");
        if (!response.ok) {
            throw new Error("Failed to fetch mood entries");
        }
        allMoodEntries = await response.json();
        renderMoodJourney();
        handleViewMoreButton();
    } catch (error) {
        console.error("Error fetching mood entries:", error);
        const container = document.getElementById("mood-journey-map");
        if (container) {
            container.innerText = "Error: Unable to fetch mood journey data.";
        }
    }
}

function getColorForMood(mood) {
    // Map mood values to colors
    switch (mood.toLowerCase()) {
        case "good":
            return "#28a745"; // green
        case "neutral":
            return "#ffc107"; // yellow/orange
        case "bad":
            return "#dc3545"; // red
        default:
            return "#6c757d"; // gray for unknown
    }
}

function getBackgroundImageForMood(mood) {
    switch (mood.toLowerCase()) {
        case "good":
            return "url('/media/goodBanner.jpg')";
        case "neutral":
            return "url('/media/neutralBanner.jpg')";
        case "bad":
            return "url('/media/badBanner.jpg')";
        default:
            return "none";
    }
}

function renderMoodJourney() {
    const container = document.getElementById("mood-journey-map");
    if (!container) return;

    // Clear existing content
    container.innerHTML = "";

    // Determine the 15 most recent entries
    const recentEntries = allMoodEntries.slice().reverse().slice(0, 15);

    // Set background image based on the most recent mood entry
    if (recentEntries.length > 0) {
        const latestMood = recentEntries[0].mood;
        container.style.backgroundImage = getBackgroundImageForMood(latestMood);
        container.style.backgroundSize = "cover";
        container.style.backgroundPosition = "center";
    } else {
        container.style.backgroundImage = "none";
    }

    // Create a horizontal timeline container using flexbox
    const timeline = document.createElement("div");
    timeline.style.display = "flex";
    timeline.style.alignItems = "center";
    timeline.style.justifyContent = "flex-start";
    timeline.style.overflowX = "auto";
    timeline.style.padding = "10px";
    timeline.style.borderRadius = "4px";
    // timeline.style.border = "1px solid #ccc";
    // timeline.style.backgroundColor = "rgba(248, 249, 250, 0.8)";

    recentEntries.forEach(entry => {
        // Create a marker element for each mood entry
        const marker = document.createElement("div");
        marker.style.width = "30px";
        marker.style.height = "30px";
        marker.style.borderRadius = "50%";
        marker.style.backgroundColor = getColorForMood(entry.mood);
        marker.style.border = "2px solid white"; // white outline
        marker.style.marginRight = "10px";
        marker.style.cursor = "pointer";
        marker.title = `${entry.mood} - ${new Date(entry.timestamp).toLocaleString()}`;

        // On marker click, display details in the mood-details div
        marker.addEventListener("click", () => {
            const details = document.getElementById("mood-details");
            if (details) {
                details.innerHTML = `
          <p><strong>Mood:</strong> ${entry.mood}</p>
          <p><strong>Time:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
          <p><strong>Note:</strong> ${entry.note}</p>
        `;
            }
        });

        timeline.appendChild(marker);
    });

    container.appendChild(timeline);
}

// Show older mood entries (beyond the 15 most recent) in a vertical list
function showOlderEntries() {
    // Determine older entries: reverse the array and then skip the first 15
    const olderEntries = allMoodEntries.slice().reverse().slice(15);
    const moreContainer = document.getElementById("more-entries");
    if (!moreContainer) return;
    moreContainer.innerHTML = "";
    if (olderEntries.length === 0) {
        moreContainer.innerHTML = "<p>No older entries.</p>";
        return;
    }
    olderEntries.forEach(entry => {
        const entryDiv = document.createElement("div");
        entryDiv.style.borderBottom = "1px solid #ccc";
        entryDiv.style.padding = "5px 0";
        entryDiv.innerHTML = `
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p><strong>Time:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
      <p><strong>Note:</strong> ${entry.note}</p>
    `;
        moreContainer.appendChild(entryDiv);
    });
}

// Manage the View More button
function handleViewMoreButton() {
    const viewMoreBtn = document.getElementById("view-more-btn");
    if (!viewMoreBtn) return;
    // Check if there are older entries
    if (allMoodEntries.length > 15) {
        viewMoreBtn.style.display = "block";
        viewMoreBtn.onclick = showOlderEntries;
    } else {
        viewMoreBtn.style.display = "none";
    }
}