/**
 * Dear Marker
 *
 * This is by far the worst code file I have ever created. This is the culmination of the fear, hate
 * anger, suffering and pure unadulterated resilience which has gone into trying to complete my course.
 * This file is where it ends, the lifeblood of the final obstacle I must face before I can leave
 * the University of Stirling!
 *
 * This file is the legacy I leave behind,
 *
 * May the Force Be With You,
 * 3024246
 * **/


const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Session middleware: A more secure method would be used in production but this is to show how a login feature could work
app.use(session({
    secret: 'b70DGDbOY0ZBpdicGogzPohbs0XL4PO7', //This is completely irrelevant, I don't fully know why I've done this but hey, it'd be stored and encrypted IRL
    resave: false,
    saveUninitialized: false
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Authentication middleware for HTML pages
// Only allow access to login-client.html and home-general.html if not logged in
app.use((req, res, next) => {
    const ext = path.extname(req.path);
    const isHtmlRequest = ext === '.html' || ext === '';

    if (req.method === 'GET' && isHtmlRequest) {
        const allowedPaths = ['/login-client.html', '/home-general.html'];
        if (!allowedPaths.includes(req.path) && !req.session.loggedIn) {
            return res.redirect('/login-client.html');
        }
    }
    next();
});
// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define file paths for data
const moodDataFilePath = path.join(__dirname, 'moodEntries.json');
const messageDataFilePath = path.join(__dirname, 'messages.json');

// Mood Tracking Endpoints
app.post('/api/moods', (req, res) => {
    const moodEntry = req.body;
    let moodEntries = [];

    try {
        if (fs.existsSync(moodDataFilePath)) {
            const data = fs.readFileSync(moodDataFilePath);
            moodEntries = JSON.parse(data || '[]');
        }
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        return res.status(500).send('Error processing request.');
    }

    moodEntries.push(moodEntry);
    fs.writeFileSync(moodDataFilePath, JSON.stringify(moodEntries, null, 2));
    res.status(200).send('Mood entry saved.');
});

app.get('/api/moods', (req, res) => {
    try {
        if (fs.existsSync(moodDataFilePath)) {
            const data = fs.readFileSync(moodDataFilePath);
            const moodEntries = JSON.parse(data || '[]');
            res.json(moodEntries);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        res.status(500).send('Error fetching mood entries.');
    }
});

app.get('/api/mood-graph-data', (req, res) => {
    try {
        if (fs.existsSync(moodDataFilePath)) {
            const data = fs.readFileSync(moodDataFilePath, 'utf8');
            const moodEntries = JSON.parse(data || '[]');
            // Group mood entries by date and count occurrences per mood category
            const grouped = {};
            moodEntries.forEach(entry => {
                const date = entry.timestamp.split('T')[0]; // YYYY-MM-DD
                if (!grouped[date]) {
                    grouped[date] = { good: 0, neutral: 0, bad: 0 };
                }
                const moodKey = entry.mood.toLowerCase();
                if (grouped[date][moodKey] !== undefined) {
                    grouped[date][moodKey]++;
                }
            });
            res.status(200).json(grouped);
        } else {
            res.json({});
        }
    } catch (error) {
        console.error("Error fetching mood graph data:", error);
        res.status(500).send("Error fetching mood graph data.");
    }
});

/////////////////////////////////////////////////////////////////////////////
// Messaging System Endpoints
app.post('/api/messages', (req, res) => {
    console.log("Received POST request with body:", req.body);

    const { sender, message } = req.body;

    if (!sender || !message) {
        console.error('Invalid request:', req.body);
        return res.status(400).send('Both sender and message are required.');
    }

    const newMessage = {
        sender: sender,
        text: `${sender} sent a message at ${new Date().toLocaleString()}: ${message}`,
        timestamp: new Date().toISOString()
    };

    let messages = [];
    try {
        if (fs.existsSync(messageDataFilePath)) {
            const data = fs.readFileSync(messageDataFilePath, 'utf8');
            console.log("Current messages file content:", data);
            messages = JSON.parse(data || '[]');
        }
    } catch (error) {
        console.error('Error reading or parsing messages file:', error);
        return res.status(500).send('Error processing request.');
    }

    messages.push(newMessage);
    console.log("Updated messages array:", messages);

    try {
        fs.writeFileSync(messageDataFilePath, JSON.stringify(messages, null, 2), 'utf8');
        console.log("Message successfully written to file.");
    } catch (error) {
        console.error('Error writing to messages file:', error);
        return res.status(500).send('Error saving message.');
    }

    res.status(200).send('Message sent successfully.');
});

app.get('/api/messages', (req, res) => {
    try {
        if (fs.existsSync(messageDataFilePath)) {
            const data = fs.readFileSync(messageDataFilePath);
            const messages = JSON.parse(data || '[]');
            res.json(messages);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading or parsing messages file:', error);
        res.status(500).send('Error fetching messages.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/////////////////////////////////////////////////////////////////////////////
// Module 1 Data Endpoints (for CBT module tickbox responses)
app.post('/api/module1data', (req, res) => {
    const moduleData = req.body;
    const moduleDataFilePath = path.join(__dirname, 'module1Data.json');
    let moduleDataArray = [];

    try {
        if (fs.existsSync(moduleDataFilePath)) {
            const data = fs.readFileSync(moduleDataFilePath, 'utf8');
            moduleDataArray = JSON.parse(data || '[]');
            if (!Array.isArray(moduleDataArray)) {
                moduleDataArray = [];
            }
        }
    } catch (error) {
        console.error('Error reading or parsing module1Data.json:', error);
        return res.status(500).send('Error processing request.');
    }

    moduleDataArray.push(moduleData);

    try {
        fs.writeFileSync(moduleDataFilePath, JSON.stringify(moduleDataArray, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to module1Data.json:', error);
        return res.status(500).send('Error saving module data.');
    }

    res.status(200).send('Module data saved successfully.');
});

app.get('/api/module1data', (req, res) => {
    const moduleDataFilePath = path.join(__dirname, 'module1Data.json');
    try {
        if (fs.existsSync(moduleDataFilePath)) {
            const data = fs.readFileSync(moduleDataFilePath, 'utf8');
            const moduleDataArray = JSON.parse(data || '[]');
            res.json(moduleDataArray);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading or parsing module1Data.json:', error);
        res.status(500).send('Error fetching module data.');
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Module 2 Data Endpoints (for custom ABC reflection submissions)
app.post('/api/module2data', (req, res) => {
    const module2Data = req.body;
    if (!module2Data.reflection) {
        return res.status(400).send('Reflection text is required.');
    }
    module2Data.timestamp = new Date().toISOString();

    const module2DataFilePath = path.join(__dirname, 'module2Data.json');
    let module2DataArray = [];

    try {
        if (fs.existsSync(module2DataFilePath)) {
            const data = fs.readFileSync(module2DataFilePath, 'utf8');
            module2DataArray = JSON.parse(data || '[]');
            if (!Array.isArray(module2DataArray)) {
                module2DataArray = [];
            }
        }
    } catch (error) {
        console.error('Error reading or parsing module2Data.json:', error);
        return res.status(500).send('Error processing request.');
    }

    module2DataArray.push(module2Data);

    try {
        fs.writeFileSync(module2DataFilePath, JSON.stringify(module2DataArray, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to module2Data.json:', error);
        return res.status(500).send('Error saving module data.');
    }

    res.status(200).send('Module2 data saved successfully.');
});

app.get('/api/module2data', (req, res) => {
    const module2DataFilePath = path.join(__dirname, 'module2Data.json');
    try {
        if (fs.existsSync(module2DataFilePath)) {
            const data = fs.readFileSync(module2DataFilePath, 'utf8');
            const module2DataArray = JSON.parse(data || '[]');
            res.json(module2DataArray);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading or parsing module2Data.json:', error);
        res.status(500).send('Error fetching module2 data.');
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Module 3 Data Endpoints (for SMART goal submissions)
app.post('/api/module3data', (req, res) => {
    const goalData = req.body;
    if (!goalData.specific || !goalData.measurable || !goalData.achievable || !goalData.relevant || !goalData.timebound) {
        return res.status(400).send('All SMART goal fields are required.');
    }
    goalData.timestamp = new Date().toISOString();
    const module3DataFilePath = path.join(__dirname, 'module3Data.json');
    let module3DataArray = [];

    try {
        if (fs.existsSync(module3DataFilePath)) {
            const data = fs.readFileSync(module3DataFilePath, 'utf8');
            module3DataArray = JSON.parse(data || '[]');
            if (!Array.isArray(module3DataArray)) {
                module3DataArray = [];
            }
        }
    } catch (error) {
        console.error('Error reading module3Data.json:', error);
        return res.status(500).send('Error processing request.');
    }

    module3DataArray.push(goalData);

    try {
        fs.writeFileSync(module3DataFilePath, JSON.stringify(module3DataArray, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to module3Data.json:', error);
        return res.status(500).send('Error saving SMART goal.');
    }

    res.status(200).send('SMART goal saved successfully.');
});

app.get('/api/module3data', (req, res) => {
    const module3DataFilePath = path.join(__dirname, 'module3Data.json');
    try {
        if (fs.existsSync(module3DataFilePath)) {
            const data = fs.readFileSync(module3DataFilePath, 'utf8');
            const module3DataArray = JSON.parse(data || '[]');
            res.json(module3DataArray);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading module3Data.json:', error);
        res.status(500).send('Error fetching SMART goal data.');
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Module 4 Data Endpoints (for Activity Scheduling submissions)
app.post('/api/module4data', (req, res) => {
    const module4Data = req.body;
    if (!module4Data.schedule || !Array.isArray(module4Data.schedule) || module4Data.schedule.length === 0) {
        return res.status(400).send('Schedule data is required.');
    }
    module4Data.timestamp = new Date().toISOString();
    const module4DataFilePath = path.join(__dirname, 'module4Data.json');
    let module4DataArray = [];

    try {
        if (fs.existsSync(module4DataFilePath)) {
            const data = fs.readFileSync(module4DataFilePath, 'utf8');
            module4DataArray = JSON.parse(data || '[]');
            if (!Array.isArray(module4DataArray)) {
                module4DataArray = [];
            }
        }
    } catch (error) {
        console.error('Error reading module4Data.json:', error);
        return res.status(500).send('Error processing request.');
    }

    module4DataArray.push(module4Data);

    try {
        fs.writeFileSync(module4DataFilePath, JSON.stringify(module4DataArray, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to module4Data.json:', error);
        return res.status(500).send('Error saving schedule.');
    }

    res.status(200).send('Schedule saved successfully.');
});

app.get('/api/module4data', (req, res) => {
    const module4DataFilePath = path.join(__dirname, 'module4Data.json');
    try {
        if (fs.existsSync(module4DataFilePath)) {
            const data = fs.readFileSync(module4DataFilePath, 'utf8');
            const module4DataArray = JSON.parse(data || '[]');
            res.json(module4DataArray);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading module4Data.json:', error);
        res.status(500).send('Error fetching schedule data.');
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Profile Endpoints
app.get('/api/profile', (req, res) => {
    const profilePath = path.join(__dirname, 'profileData.json');
    try {
        if (fs.existsSync(profilePath)) {
            const data = fs.readFileSync(profilePath, 'utf8');
            res.json(JSON.parse(data || "{}"));
        } else {
            res.json({});
        }
    } catch (error) {
        console.error("Error reading profileData.json:", error);
        res.status(500).send("Error fetching profile data.");
    }
});

app.post('/api/profile', (req, res) => {
    const profileData = req.body;
    const profilePath = path.join(__dirname, 'profileData.json');
    try {
        fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2), 'utf8');
        res.status(200).send("Profile updated.");
    } catch (error) {
        console.error("Error writing profileData.json:", error);
        res.status(500).send("Error updating profile.");
    }
});

/*
// ---------------------------------------------------------------------------
// Profile Picture Upload Endpoint

// Use Multer to handle file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// POST endpoint for profile picture upload
app.post('/api/profilePicture', upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});
*/

// ---------------------------------------------------------------------------
// Mark Completed Endpoint for schedule and SMART goals
app.patch('/api/markCompleted', (req, res) => {
    // Stub implementation for marking an item as completed.
    res.status(200).send("Item marked as completed.");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loginDataFilePath = path.join(__dirname, 'login.json');

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const loginData = JSON.parse(fs.readFileSync(loginDataFilePath, 'utf8'));
        const user = loginData.users.find(user => user.username === username && user.password === password);
        if (user) {
            // Mark user as logged in
            req.session.loggedIn = true;
            req.session.username = username;
            req.session.role = user.role;
            res.status(200).json({ role: user.role });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Error reading login data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const module5DataFilePath = path.join(__dirname, 'module5Data.json');

app.post('/api/module5data', (req, res) => {
    const module5Data = req.body;
    if (!module5Data.fears || !Array.isArray(module5Data.fears) || module5Data.fears.length === 0 ||
        !module5Data.selectedFear || !module5Data.exposureLadder || !Array.isArray(module5Data.exposureLadder) || module5Data.exposureLadder.length === 0) {
        return res.status(400).send('Incomplete Module 5 data.');
    }
    module5Data.timestamp = new Date().toISOString();
    let module5DataArray = [];

    try {
        if (fs.existsSync(module5DataFilePath)) {
            const data = fs.readFileSync(module5DataFilePath, 'utf8');
            module5DataArray = JSON.parse(data || '[]');
            if (!Array.isArray(module5DataArray)) module5DataArray = [];
        }
    } catch (error) {
        console.error('Error reading module5Data.json:', error);
        return res.status(500).send('Error processing request.');
    }

    module5DataArray.push(module5Data);

    try {
        fs.writeFileSync(module5DataFilePath, JSON.stringify(module5DataArray, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to module5Data.json:', error);
        return res.status(500).send('Error saving Module 5 data.');
    }

    // Award the badge in the user's profile
    const profilePath = path.join(__dirname, 'profileData.json');
    let profileData = {};
    try {
        if (fs.existsSync(profilePath)) {
            profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        }
    } catch (error) {
        console.error("Error reading profile data:", error);
        return res.status(500).send("Error processing request.");
    }
    if (!profileData.badges) profileData.badges = [];
    const badgeName = "Fear Conqueror";
    const alreadyAwarded = profileData.badges.some(badge => badge.name === badgeName);
    if (!alreadyAwarded) {
        profileData.badges.push({
            name: badgeName,
            badgeImage: "media/badgeMod5.png",
            tooltip: "Awarded for completing Module 5: Facing Your Fears"
        });
    }
    try {
        fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2), 'utf8');
        res.status(200).send("Module 5 data saved and badge awarded.");
    } catch (error) {
        console.error("Error updating profile data:", error);
        res.status(500).send("Error updating profile.");
    }
});
app.get('/api/module5data', (req, res) => {
    const module5DataFilePath = path.join(__dirname, 'module5Data.json');
    try {
        if (fs.existsSync(module5DataFilePath)) {
            const data = fs.readFileSync(module5DataFilePath, 'utf8');
            const module5DataArray = JSON.parse(data || '[]');
            res.json(module5DataArray);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading or parsing module5Data.json:', error);
        res.status(500).send('Error fetching Module 5 data.');
    }
});