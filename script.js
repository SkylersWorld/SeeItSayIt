// 1. Initialize Map
const map = L.map('map').setView([51.505, -0.09], 13); // Default view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. Authentication Mock Logic
let isLoggedIn = false;

function handleLogin() {
    const email = document.getElementById('email').value;
    if(email.includes('@')) {
        isLoggedIn = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('user-panel').style.display = 'block';
        document.getElementById('display-name').innerText = email;
        alert("Account Verified. You may now transmit reports.");
    } else {
        alert("Invalid Email Format.");
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-panel').style.display = 'none';
}

// 3. Reporting Logic
function submitReport() {
    if (!isLoggedIn) {
        alert("ACCESS DENIED: You must log in to submit a report.");
        return;
    }

    const type = document.getElementById('incident-type').value;
    const desc = document.getElementById('incident-desc').value;
    const name = document.getElementById('reporter-name').value || "Anonymous";

    // Create Alert Object
    const newAlert = {
        type: type,
        description: desc,
        reporter: name,
        time: new Date().toLocaleTimeString(),
        // Mocking random location near center for demo
        lat: 51.505 + (Math.random() - 0.5) * 0.05,
        lng: -0.09 + (Math.random() - 0.5) * 0.05
    };

    addAlertToFeed(newAlert);
    addMarkerToMap(newAlert);
    
    // In real app: send via WebSocket here
    // stompClient.send("/app/report", {}, JSON.stringify(newAlert));
}

// 4. Update UI
function addAlertToFeed(alert) {
    const feed = document.getElementById('feed-panel');
    const div = document.createElement('div');
    div.className = 'alert-card';
    div.innerHTML = `
        <span class="alert-type urgent-text">${alert.type}</span> 
        <span>[${alert.time}]</span><br>
        Details: ${alert.description}<br>
        Reporter: ${alert.reporter}
    `;
    feed.prepend(div);
}

function addMarkerToMap(alert) {
    L.marker([alert.lat, alert.lng]).addTo(map)
        .bindPopup(`<b style="color:red">${alert.type}</b><br>${alert.description}`)
        .openPopup();
}
// 3. Alert Logic
function submitAlert() {
    // ... existing login check ...
    if (!isLoggedIn) {
        alert("ACCESS DENIED: You must log in to submit a report.");
        return;
    }

    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;
    const isAnon = document.getElementById('anon').checked;
    const user = isAnon ? "Anonymous" : document.getElementById('username-display').innerText;

    // NEW FIELD CAPTURE
    const phone = document.getElementById('reporter-phone').value;
    const postalCode = document.getElementById('incident-postal-code').value;

    if(!type || !desc || !phone || !postalCode) { // Now phone and postal code are required
        alert("Please fill in all incident fields, phone number, and postal code.");
        return;
    }

    // Generate Random Location near center for demo
    // ... existing location logic ...

    // --- Data to be sent to Backend (via WebSocket) ---
    const alertData = {
        type: type,
        description: desc,
        reporterName: user,
        phoneNumber: phone, // Pass phone number
        postalCode: postalCode, // Pass postal code
        lat: lat,
        lng: lng,
        time: new Date().toLocaleTimeString()
    };
    // --- END Data to be sent to Backend ---

    addAlertToFeed(alertData); // Use the new object
    addMarkerToMap(alertData);
    
    // In real app: send via WebSocket here (Backend expects ReportRequest DTO)
    // stompClient.send("/app/report", {}, JSON.stringify(alertData));
}

// Update the Feed function to show new data
function addAlertToFeed(alert) {
    const feed = document.getElementById('feed');
    const item = document.createElement('div');
    item.className = 'alert-item';
    item.innerHTML = `
        <span class="timestamp">${alert.time}</span> | 
        <b style="color:red">${alert.type}</b> | Reported by: ${alert.reporterName}<br>
        <span style="font-style: italic;">Location ID: ${alert.postalCode}</span><br>
        ${alert.description}
    `;
    feed.prepend(item);
    // Global Variables for Connectivity and State
const BACKEND_URL = 'http://localhost:8080'; // Spring Boot default port
let stompClient = null;
let isLoggedIn = false;
let userEmail = null;
let userPhone = null;

// --- 1. WebSocket Connectivity ---
function connect() {
    const socket = new SockJS(BACKEND_URL + '/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);
        document.getElementById('system-status').innerText = 'System Operational (Live)';
        
        // Subscribe to the public alert topic
        stompClient.subscribe('/topic/alerts', (alertMessage) => {
            const alert = JSON.parse(alertMessage.body);
            // Function to update the UI
            addAlertToFeed(alert);
            addMarkerToMap(alert);
        });

    }, (error) => {
        console.error('Connection error: ' + error);
        document.getElementById('system-status').innerText = 'System Offline (Connection Error)';
    });
}

// Initialize connection when the script loads
connect();


// --- 2. AUTHENTICATION & STATE MANAGEMENT ---

// Updated handleLogin to simulate a real login (assumes previous signup)
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // NOTE: Real login uses JWT/Session. We mock state here for simplicity.
    if (email.includes('@') && password.length > 0) {
        isLoggedIn = true;
        userEmail = email;
        // In a real app, you fetch user data (including phone) here.
        userPhone = "+1234567890"; // Mock phone number after login

        // UI Updates
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('username-display').innerText = userEmail;
        
        document.getElementById('report-panel').style.opacity = '1';
        document.getElementById('type').disabled = false;
        document.getElementById('desc').disabled = false;
        document.getElementById('anon').disabled = false;
        document.getElementById('submit-btn').disabled = false;

        alert(`Welcome, ${email}. Reporting is now enabled.`);
    } else {
        alert("Login Failed: Invalid credentials or account not verified.");
    }
}

// Updated handleSignup to use a real HTTP fetch (assuming AuthController is running)
function handleSignup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;

    if (!email || !password || !phone) {
        alert("Registration requires all fields.");
        return;
    }

    const userData = { email, password, phoneNumber: phone };
    
    fetch(BACKEND_URL + '/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok) {
            alert("Registration successful! Check console for simulated verification link.");
            showLogin();
            document.getElementById('email').value = email;
        } else {
            return response.json().then(data => alert(`Registration Error: ${data.body}`));
        }
    })
    .catch(error => {
        console.error('Network Error:', error);
        alert('Could not reach backend server for signup.');
    });
}

// --- 3. REPORTING LOGIC (Using WebSocket) ---
function submitAlert() {
    if (!isLoggedIn || !stompClient || !stompClient.connected) {
        alert("System not connected or user not logged in. Cannot transmit alert.");
        return;
    }

    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;
    const isAnon = document.getElementById('anon').checked;
    
    // Ensure reporting fields are retrieved
    const postalCode = document.getElementById('incident-postal-code').value;

    if(!type || !desc || !postalCode) { 
        alert("Please fill in the incident type, description, and postal code.");
        return;
    }
    
    // Reporter details
    const reporter = isAnon ? "Anonymous" : userEmail;

    // Generate Mock Location (real GPS would be used in a mobile app)
    const lat = 40.7128 + (Math.random() - 0.5) * 0.02;
    const lng = -74.0060 + (Math.random() - 0.5) * 0.02;

    const alertData = {
        type: type,
        description: desc,
        reporterName: reporter,
        phoneNumber: userPhone, // Phone is tied to the logged-in user
        postalCode: postalCode,
        latitude: lat,
        longitude: lng
    };
    
    // *** KEY FIX: Send the alert data via WebSocket ***
    stompClient.send("/app/report", {}, JSON.stringify(alertData));

    // Clear form
    document.getElementById('desc').value = "";
    document.getElementById('incident-postal-code').value = "";
    alert("ALERT TRANSMITTED! Authorities are being notified via SMS.");
}
}
