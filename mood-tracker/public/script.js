// Function to submit a mood entry
async function submitMood(color) {
    const moodEntry = {
        username: "user",
        mood: color
    };

    try {
        const response = await fetch('http://localhost:8080/api/moods', { // Ensure the URL is correct
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(moodEntry)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit mood entry: ${response.statusText}`);
        }

        const message = await response.text();
        alert(message);
    } catch (error) {
        alert("Service Unavailable: Unable to submit mood entry.");
    }
}


// Function to fetch all mood entries
async function fetchMoodEntries() {
    try {
        const response = await fetch('http://localhost:8080/api/moods', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch mood entries: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length > 0) {
            data.forEach(entry => displayMoodLog(entry.mood, entry.timestamp));
        } else {
            alert('No mood entries found.');
        }
    } catch (error) {
        alert("Service Unavailable: Unable to fetch mood entries.");
    }
}

// Helper function to display mood log
function displayMoodLog(mood, timestamp) {
    const log = document.getElementById('mood-log');
    const entry = document.createElement('p');
    entry.innerText = `Mood: ${mood}, Time: ${new Date(timestamp).toLocaleString()}`;
    log.appendChild(entry);
}

// Helper function to display error messages
function displayError(message) {
    const log = document.getElementById('mood-log');
    const errorEntry = document.createElement('p');
    errorEntry.style.color = 'red';
    errorEntry.innerText = message;
    log.appendChild(errorEntry);
}