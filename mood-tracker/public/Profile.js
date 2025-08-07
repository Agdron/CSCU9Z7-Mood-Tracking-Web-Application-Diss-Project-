/**
 * Laughs * "I'm in danger"
 *
 * I hate this file with a burning passion and I think it also hates me!
 * Good luck marking this shit show
 * */


document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadSchedule();
    loadSMARTGoals();
    loadBadges();


    // document.getElementById("upload-image").addEventListener("change", handleProfilePicUpload);
    // document.getElementById("save-profile").addEventListener("click", saveProfile);
});

// Load profile data from /api/profile and populate fields, including badges.
async function loadProfile() {
    try {
        const response = await fetch("http://localhost:3000/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile data");
        const profile = await response.json();
        document.getElementById("user-name").value = profile.name || "";
        document.getElementById("user-bio").value = profile.bio || "";
        document.getElementById("profile-pic").src = profile.profilePicture || "media/default-avatar.jpg";
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// Save profile data (name, bio, and profilePicture) to /api/profile.
async function saveProfile() {
    const profile = {
        name: document.getElementById("user-name").value.trim(),
        bio: document.getElementById("user-bio").value.trim(),
        profilePicture: document.getElementById("profile-pic").src,
        badges: [] // Preserve badges if they exist; they will be updated via awardBadge function.
    };

    // First, load existing profile data to retain badges.
    try {
        const res = await fetch("http://localhost:3000/api/profile");
        if (res.ok) {
            const existingProfile = await res.json();
            if (existingProfile.badges && Array.isArray(existingProfile.badges)) {
                profile.badges = existingProfile.badges;
            }
        }
    } catch (error) {
        console.error("Error loading existing profile for badges:", error);
    }

    try {
        const response = await fetch("http://localhost:3000/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile)
        });
        if (!response.ok) throw new Error("Failed to save profile");
        alert("Profile updated successfully!");
        loadBadges();
    } catch (error) {
        console.error("Error saving profile:", error);
    }
}

/*
function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Please select an image.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("profile-pic").src = e.target.result;
    };
    reader.readAsDataURL(file);
}
*/

// Load schedule data from /api/module4data and display tasks correctly.
async function loadSchedule() {
    try {
        const response = await fetch("http://localhost:3000/api/module4data");
        if (!response.ok) throw new Error("Failed to fetch schedule data");
        const scheduleDataArray = await response.json();
        const container = document.getElementById("schedule-container");
        container.innerHTML = "";
        // Each entry in scheduleDataArray is expected to have a 'schedule' array.
        scheduleDataArray.forEach((entry, entryIndex) => {
            if (entry.schedule && Array.isArray(entry.schedule)) {
                entry.schedule.forEach((task, taskIndex) => {
                    const activity = task.activity || "Unknown Activity";
                    const date = task.date || "Unknown Date";
                    const time = task.time || "Unknown Time";
                    const taskDiv = document.createElement("div");
                    taskDiv.className = "task-item";
                    taskDiv.id = `schedule-${entryIndex}-${taskIndex}`;
                    taskDiv.innerHTML = `<span>${activity} on ${date} at ${time}</span>
                                          <button class="btn btn-success btn-sm" onclick="markCompleted('${entryIndex}', '${taskIndex}', 'schedule')">Complete</button>`;
                    container.appendChild(taskDiv);
                });
            }
        });
    } catch (error) {
        console.error("Error loading schedule:", error);
    }
}

// Load SMART goals from /api/module3data and display them.
async function loadSMARTGoals() {
    try {
        const response = await fetch("http://localhost:3000/api/module3data");
        if (!response.ok) throw new Error("Failed to fetch SMART goal data");
        const goalDataArray = await response.json();
        const container = document.getElementById("goal-container");
        container.innerHTML = "";
        goalDataArray.forEach((goal, index) => {
            const specific = goal.specific || "N/A";
            const measurable = goal.measurable || "N/A";
            const achievable = goal.achievable || "N/A";
            const relevant = goal.relevant || "N/A";
            const timebound = goal.timebound || "N/A";
            const goalDiv = document.createElement("div");
            goalDiv.className = "task-item";
            goalDiv.id = `goal-${index}`;
            goalDiv.innerHTML = `<span>${specific} | ${measurable} | ${achievable} | ${relevant} | ${timebound}</span>
                                  <button class="btn btn-success btn-sm" onclick="markCompleted('${index}', null, 'goal')">Complete</button>`;
            container.appendChild(goalDiv);
        });
    } catch (error) {
        console.error("Error loading SMART goals:", error);
    }
}

// Load and display badges from profileData.json.
async function loadBadges() {
    try {
        const response = await fetch("http://localhost:3000/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile data");
        const profile = await response.json();
        const badgeContainer = document.getElementById("badge-container");
        badgeContainer.innerHTML = "";
        if (profile.badges && Array.isArray(profile.badges) && profile.badges.length > 0) {
            profile.badges.forEach(badge => {
                const img = document.createElement("img");
                img.src = badge.badgeImage;
                img.alt = badge.module;
                img.title = badge.tooltip; // Tooltip shows module information
                img.style.width = "50px";
                img.style.margin = "5px";
                badgeContainer.appendChild(img);
            });
        } else {
            badgeContainer.innerText = "No badges earned yet.";
        }
    } catch (error) {
        console.error("Error loading badges:", error);
    }
}

// Award a badge for a module if not already awarded.
async function awardBadge(badgeObj) {
    try {
        const response = await fetch("http://localhost:3000/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile data");
        const profile = await response.json();
        if (!profile.badges || !Array.isArray(profile.badges)) {
            profile.badges = [];
        }
        // Check if the badge is already awarded by comparing badgeImage
        const alreadyAwarded = profile.badges.some(b => b.badgeImage === badgeObj.badgeImage);
        if (!alreadyAwarded) {
            profile.badges.push(badgeObj);
            // Save updated profile
            const saveResponse = await fetch("http://localhost:3000/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            if (!saveResponse.ok) throw new Error("Failed to update profile with badge");
            alert(`Badge awarded for ${badgeObj.module}!`);
            loadBadges();
        } else {
            console.log("Badge already awarded.");
        }
    } catch (error) {
        console.error("Error awarding badge:", error);
    }
}

// Mark an item (schedule or SMART goal) as completed and remove it from the UI.

//NOTE: Stub implementation
// HAHAHAHAHAHA This drove me insane, for whatever godforsaken reason, clearing from the JSON file is apprarently not allowed
async function markCompleted(entryIndex, taskIndex, type) {
    try {
        const response = await fetch("http://localhost:3000/api/markCompleted", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entryIndex, taskIndex, type })
        });
        if (!response.ok) throw new Error("Failed to mark as completed");
        if (type === "schedule") {
            const taskElement = document.getElementById(`schedule-${entryIndex}-${taskIndex}`);
            if (taskElement) taskElement.style.display = "none";
        } else if (type === "goal") {
            const goalElement = document.getElementById(`goal-${entryIndex}`);
            if (goalElement) goalElement.style.display = "none";
        }
        alert("Item marked as completed.");
    } catch (error) {
        console.error("Error marking item as completed:", error);
    }
}

async function loadExposureLadder() {
    try {
        const response = await fetch("/api/module5data");
        if (!response.ok) throw new Error("Failed to fetch Module 5 data");
        const module5DataArray = await response.json();
        const displayContainer = document.getElementById("exposure-ladder-display");
        displayContainer.innerHTML = "";
        if (module5DataArray.length === 0) {
            displayContainer.innerText = "No exposure ladder data available.";
            return;
        }
        // Sort by timestamp descending and take the latest entry
        module5DataArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latest = module5DataArray[0];
        if (!latest.exposureLadder || latest.exposureLadder.length === 0) {
            displayContainer.innerText = "No exposure ladder data available.";
            return;
        }
        const heading = document.createElement("h4");
        heading.innerText = `Exposure Ladder for: ${latest.selectedFear.text}`;
        displayContainer.appendChild(heading);
        const ol = document.createElement("ol");
        latest.exposureLadder.forEach(step => {
            const li = document.createElement("li");
            li.innerText = step;
            ol.appendChild(li);
        });
        displayContainer.appendChild(ol);
    } catch (error) {
        console.error("Error loading exposure ladder:", error);
        document.getElementById("exposure-ladder-display").innerText = "Error loading exposure ladder data.";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadExposureLadder();
});