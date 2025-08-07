// Function to submit mood entry
async function submitMood() {
    const username = 'User';
    const mood = document.querySelector('input[name="mood"]:checked')?.value;
    const note = document.getElementById('mood-note').value.trim();

    if (!mood) {
        alert('Please select a mood.');
        return;
    }

    const moodEntry = {
        username,
        mood,
        note: note || 'No additional notes.',
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch('http://localhost:3000/api/moods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(moodEntry),
        });

        if (!response.ok) throw new Error('Failed to submit mood entry.');

        document.getElementById('output').innerText = 'Mood entry successfully submitted.';
        document.getElementById('mood-note').value = '';
        document.querySelector('input[name="mood"]:checked').checked = false;

        // After successful submission, check for badge awards
        await checkAndAwardMoodBadges();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').innerText = 'Error: Unable to submit mood entry.';
    }
}

// Function to check and award mood tracking badges based on total mood entries
async function checkAndAwardMoodBadges() {
    try {
        // Fetch current mood entries
        const response = await fetch('http://localhost:3000/api/moods');
        if (!response.ok) throw new Error('Failed to fetch mood entries.');
        const moodEntries = await response.json();

        // Count mood entries
        const moodCount = moodEntries.length;

        // Define badge thresholds
        const badges = [
            { threshold: 5, name: "Mood Tracking Beginner", badgeImage: "media/beginnerBadge.png", tooltip: "Logged 5 mood entries" },
            { threshold: 15, name: "Mood Tracking Novice", badgeImage: "media/noviceBadge.png", tooltip: "Logged 15 mood entries" },
            { threshold: 30, name: "Mood Tracking Expert", badgeImage: "media/expertBadge.png", tooltip: "Logged 30 mood entries" }
        ];

        // Fetch profile data
        const profileResponse = await fetch('http://localhost:3000/api/profile');
        if (!profileResponse.ok) throw new Error('Failed to fetch profile data.');
        const profile = await profileResponse.json();

        if (!profile.badges || !Array.isArray(profile.badges)) {
            profile.badges = [];
        }

        let newBadgesAwarded = false;

        // Check each badge threshold and award if not already earned
        badges.forEach(badge => {
            const alreadyAwarded = profile.badges.some(b => b.badgeImage === badge.badgeImage);
            if (moodCount >= badge.threshold && !alreadyAwarded) {
                profile.badges.push(badge);
                newBadgesAwarded = true;
            }
        });

        // Update profile if any new badges were awarded
        if (newBadgesAwarded) {
            const updateResponse = await fetch('http://localhost:3000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (!updateResponse.ok) throw new Error('Failed to update profile with new badges.');
            alert("New badge(s) earned! Check your profile.");
            showBadgeModal();
        }
    } catch (error) {
        console.error('Error checking and awarding badges:', error);
    }
}

// Ensure event listeners are attached correctly
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("send-message-btn").addEventListener("click", sendMessage);
    document.getElementById("fetch-messages-btn").addEventListener("click", fetchMessages);

    // Start live updates after DOM has loaded
    setInterval(fetchMessages, 5000);

    // Attach event listener for mood submission
    document.getElementById('submit-mood-btn').addEventListener('click', submitMood);
});

function sendMessage() {
    const messageText = document.getElementById("message-text").value.trim();
    if (!messageText) {
        alert("Please enter a message.");
        return;
    }

    fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: "User", message: messageText })
    })
        .then(response => response.text())
        .then(data => {
            alert(data);
            fetchMessages(); // Force-refresh messages after sending
        })
        .catch(error => console.error('Error sending message:', error));
}

function fetchMessages() {
    fetch('/api/messages')
        .then(response => response.json())
        .then(messages => {
            const output = document.getElementById("entries-output");
            output.innerHTML = messages
                .reverse() // Newest messages first
                .map(msg => `<p>${msg.text}</p>`)
                .join("");
        })
        .catch(error => console.error('Error fetching messages:', error));
}

// Function to show the data consent modal and redirect after it is dismissed
function showBadgeModal() {
    const badgeModalEl = document.getElementById('badgeModal');
    const badgeModal = new bootstrap.Modal(badgeModalEl);
    // Listen for the modal being hidden so we can then redirect
    badgeModalEl.addEventListener('hidden.bs.modal', () => {
        const targetUrl = sessionStorage.getItem("targetUrl");
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    }, { once: true });
    badgeModal.show();
}
// Attach event listener for mood submission
document.getElementById('submit-mood-btn').addEventListener('click', submitMood);
