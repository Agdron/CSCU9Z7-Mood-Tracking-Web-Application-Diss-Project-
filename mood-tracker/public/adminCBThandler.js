document.addEventListener("DOMContentLoaded", () => {
    fetchModule1Data();
    fetchModule2Data();
    fetchModule3Data();
});

function switchModule(index) {
    const carousel = new bootstrap.Carousel(document.getElementById("moduleCarousel"));
    carousel.to(index);
}

async function fetchModule1Data() {
    try {
        const response = await fetch("http://localhost:3000/api/module1data");
        if (!response.ok) throw new Error("Failed to fetch module 1 data");
        const module1Data = await response.json();
        renderModuleData("module1-data", module1Data, "Module 1: Thought Records");
    } catch (error) {
        console.error("Error fetching module 1 data:", error);
        document.getElementById("module1-data").innerText = "Error: Unable to fetch module 1 data.";
    }
}

async function fetchModule2Data() {
    try {
        const response = await fetch("http://localhost:3000/api/module2data");
        if (!response.ok) throw new Error("Failed to fetch module 2 data");
        const module2Data = await response.json();
        renderModuleData("module2-data", module2Data, "Module 2: Custom ABC Scenarios");
    } catch (error) {
        console.error("Error fetching module 2 data:", error);
        document.getElementById("module2-data").innerText = "Error: Unable to fetch module 2 data.";
    }
}

async function fetchModule3Data() {
    try {
        const response = await fetch("http://localhost:3000/api/module3data");
        if (!response.ok) throw new Error("Failed to fetch module 3 data");
        const module3Data = await response.json();
        renderModuleData("module3-data", module3Data, "Module 3: SMART Goals");
    } catch (error) {
        console.error("Error fetching module 3 data:", error);
        document.getElementById("module3-data").innerText = "Error: Unable to fetch module 3 data.";
    }
}

function renderModuleData(containerId, dataArray, moduleTitle) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (dataArray.length === 0) {
        container.innerHTML = "<p>No data available.</p>";
        return;
    }

    dataArray.forEach((entry, index) => {
        const card = document.createElement("div");
        card.className = "card mb-3 p-3";
        let content = `<h5>${moduleTitle} - Submission ${index + 1}</h5>
                       <p><strong>Submitted on:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>`;

        // Check for Module 1 data: Thought Records
        if (entry.section) {
            content += `<p><strong>Section:</strong> ${entry.section}</p>`;
            if (entry.thoughts && entry.thoughts.length > 0) {
                content += `<p><strong>Thoughts:</strong> ${entry.thoughts.join(", ")}</p>`;
            }
            if (entry.emotions && entry.emotions.length > 0) {
                content += `<p><strong>Emotions:</strong> ${entry.emotions.join(", ")}</p>`;
            }
            if (entry.physical && entry.physical.length > 0) {
                content += `<p><strong>Physical Symptoms:</strong> ${entry.physical.join(", ")}</p>`;
            }
            if (entry.behaviours && entry.behaviours.length > 0) {
                content += `<p><strong>Behaviours:</strong> ${entry.behaviours.join(", ")}</p>`;
            }
        }
        // Check for Module 2 data: Custom ABC Scenarios
        else if (entry.reflection) {
            content += `<p><strong>Reflection:</strong> ${entry.reflection}</p>`;
        }
        // Check for Module 3 data: SMART Goals
        else if (entry.specific) {
            content += `<p><strong>SMART Goal:</strong> I will ${entry.specific} in a way that is measurable by ${entry.measurable}, achievable by ${entry.achievable}, relevant because ${entry.relevant}, and I aim to accomplish it within ${entry.timebound}.</p>`;
        } else {
            // Fallback to display raw JSON if format is unrecognized
            content += `<pre>${JSON.stringify(entry, null, 2)}</pre>`;
        }

        card.innerHTML = content;
        container.appendChild(card);
    });
}
