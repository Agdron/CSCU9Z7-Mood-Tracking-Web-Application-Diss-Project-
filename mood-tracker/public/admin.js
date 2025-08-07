// Function to fetch and display all mood entries
async function fetchMoodEntries() {
    try {
        const response = await fetch('http://localhost:3000/api/moods');
        if (!response.ok) throw new Error('Failed to fetch mood entries.');

        const moodEntries = await response.json();
        const output = document.getElementById('mood-entries-output');
        if (!output) return;

        output.innerHTML = '';

        // Display newest entries first
        moodEntries.slice().reverse().forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.style.marginBottom = "10px";
            entryElement.innerHTML = `
                <strong>${entry.username}</strong> logged a mood at <em>${new Date(entry.timestamp).toLocaleString()}</em>:<br>
                Mood: ${entry.mood}<br>
                Note: ${entry.note}<hr>
            `;
            output.appendChild(entryElement);
        });
    } catch (error) {
        console.error('Error fetching mood entries:', error);
        document.getElementById('mood-entries-output').innerText = 'Error: Unable to fetch mood entries.';
    }
}

// Function to fetch messages
async function fetchMessages() {
    try {
        const response = await fetch('/api/messages');
        if (!response.ok) throw new Error('Failed to fetch messages.');
        const messages = await response.json();
        const output = document.getElementById("messages-output");
        if (!output) return;
        output.innerHTML = '';
        messages.slice().reverse().forEach(msg => {
            const msgElement = document.createElement('p');
            msgElement.innerText = msg.text;
            output.appendChild(msgElement);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        document.getElementById("messages-output").innerText = 'Error: Unable to fetch messages.';
    }
}

// Function to send a message as Admin
function sendMessage() {
    const messageText = document.getElementById("message-text").value.trim();
    if (!messageText) {
        alert("Please enter a message.");
        return;
    }

    fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: "Admin", message: messageText })
    })
        .then(response => response.text())
        .then(data => {
            alert(data);
            fetchMessages(); // Refresh messages after sending
        })
        .catch(error => console.error('Error sending message:', error));
}

// Function to load mood graph data and render the graph using Chart.js
async function loadMoodGraph() {
    try {
        // Fetch aggregated mood data from new endpoint
        const response = await fetch("http://localhost:3000/api/mood-graph-data");
        if (!response.ok) throw new Error("Failed to fetch mood graph data.");
        const moodDataByDate = await response.json();

        // Prepare data for the chart
        const labels = Object.keys(moodDataByDate).sort(); // sorted dates
        const goodData = labels.map(date => moodDataByDate[date].good || 0);
        const neutralData = labels.map(date => moodDataByDate[date].neutral || 0);
        const badData = labels.map(date => moodDataByDate[date].bad || 0);

        const ctx = document.getElementById("moodChart").getContext("2d");
        // If a chart already exists, destroy it before creating a new one
        if (window.moodChartInstance) {
            window.moodChartInstance.destroy();
        }
        window.moodChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Good",
                        data: goodData,
                        borderColor: "green",
                        fill: false
                    },
                    {
                        label: "Neutral",
                        data: neutralData,
                        borderColor: "orange",
                        fill: false
                    },
                    {
                        label: "Bad",
                        data: badData,
                        borderColor: "red",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: "Date" }
                    },
                    y: {
                        title: { display: true, text: "Count" },
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error loading mood graph:", error);
    }
}

// Attach event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const fetchBtn = document.getElementById("fetch-btn");
    if (fetchBtn) {
        fetchBtn.addEventListener("click", () => {
            loadMoodGraph();
            fetchMoodEntries();
        });
    }
    // Also auto-fetch messages
    const sendMsgBtn = document.getElementById("send-message-btn");
    const fetchMsgBtn = document.getElementById("fetch-messages-btn");
    if (sendMsgBtn) sendMsgBtn.addEventListener("click", sendMessage);
    if (fetchMsgBtn) fetchMsgBtn.addEventListener("click", fetchMessages);
    setInterval(fetchMessages, 5000);
});
