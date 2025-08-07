document.addEventListener("DOMContentLoaded", () => {
    // ===== Sorting Task =====
    const draggables = document.querySelectorAll(".draggable-item");
    const dropZones = document.querySelectorAll(".drop-zone");

    draggables.forEach(item => {
        item.addEventListener("dragstart", dragStart);
        item.addEventListener("dragend", dragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener("dragover", dragOver);
        zone.addEventListener("drop", dropItem);
    });

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.textContent);
        e.dataTransfer.effectAllowed = "move";
        e.target.classList.add("dragging");
    }

    function dragEnd(e) {
        e.target.classList.remove("dragging");
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function dropItem(e) {
        e.preventDefault();
        const draggable = document.querySelector(".draggable-item.dragging");
        if (draggable) {
            e.currentTarget.appendChild(draggable);
        }
    }

    window.checkSorting = () => {
        let allCorrect = true;
        const items = document.querySelectorAll(".draggable-item");
        items.forEach(item => {
            const parentId = item.parentElement.id;
            const correctCategory = item.getAttribute("data-category");
            if (
                (parentId === "drop-routine" && correctCategory !== "Routine") ||
                (parentId === "drop-necessary" && correctCategory !== "Necessary") ||
                (parentId === "drop-pleasurable" && correctCategory !== "Pleasurable")
            ) {
                allCorrect = false;
            }
        });
        if (allCorrect) {
            alert("Sorting is correct! You may proceed.");
            document.getElementById("sorting-next-btn").style.display = "inline-block";
        } else {
            alert("Some items are in the wrong category. Please try again.");
        }
    };
    let selectedActivity = "";
    window.selectActivity = (activity) => {
        if (!activity || activity.trim() === "") {
            alert("Please enter a valid activity.");
            return;
        }
        selectedActivity = activity;
        alert(`Activity "${activity}" selected.`);
        document.getElementById("selected-activity").innerHTML = `<p><strong>Selected Activity:</strong> ${activity}</p>`;
    };

    window.goToSchedule = () => {
        if (!selectedActivity) {
            alert("Please select an activity before proceeding.");
            return;
        }
        const carouselElement = document.getElementById("module4Carousel");
        const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
        carousel.next();
    };

    let schedule = [];
    window.saveScheduledActivity = () => {
        const date = document.getElementById("activity-date").value;
        const time = document.getElementById("activity-time").value;
        if (!date || !time) {
            alert("Please enter both date and time.");
            return;
        }
        const activityObj = {
            activity: selectedActivity,
            date: date,
            time: time
        };
        schedule.push(activityObj);
        updateScheduleList();
        document.getElementById("activity-date").value = "";
        document.getElementById("activity-time").value = "";
    };

    function updateScheduleList() {
        const list = document.getElementById("schedule-list");
        list.innerHTML = "";
        schedule.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "task-item";
            div.id = `schedule-${index}`;
            div.innerHTML = `<span>${item.activity} on ${item.date} at ${item.time}</span>
                             <button class="btn btn-success btn-sm" onclick="markCompleted(${index}, null, 'schedule')">Complete</button>`;
            list.appendChild(div);
        });
    }

    window.submitSchedule = async () => {
        if (schedule.length === 0) {
            alert("Please add at least one activity to your schedule.");
            return;
        }
        const module4Data = {
            activity: selectedActivity,
            date: schedule[0].date,
            time: schedule[0].time,
            schedule: schedule,
            timestamp: new Date().toISOString()
        };
        try {
            const response = await fetch("http://localhost:3000/api/module4data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(module4Data)
            });
            if (!response.ok) {
                throw new Error("Failed to submit schedule");
            }
            alert("Your schedule has been submitted successfully.");
            const carouselElement = document.getElementById("module4Carousel");
            const carousel = new bootstrap.Carousel(carouselElement, { interval: false });
            carousel.to(4);
            // Award Module 4 badge after successful submission
            awardBadge({
                module: "Module 4",
                badgeImage: "media/badgeMod4.png",
                tooltip: "Badge for completing Module 4: Behavioral Activation & Activity Scheduling"
            });
        } catch (error) {
            console.error("Error submitting schedule:", error);
            alert("Error submitting your schedule. Please try again.");
        }
    };
});

// Award badge function for Module 4
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
                showBadgeModal();
            }
        })
        .then(() => {
            showBadgeModal();
        })
        .catch(err => console.error("Error awarding Module 4 badge:", err));
}
// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);

    badgeModal.show();
}