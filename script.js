let currentCaptchas = {}; 


// Opening Screen Functionality
function initOpeningScreen() {
    const openingScreen = document.getElementById('opening-screen');
    const logoVideo = document.querySelector('.logo-video');
    
    if (!openingScreen) return;
    
    // Check if video exists and handle its events
    if (logoVideo) {
        // When video ends, wait a moment then fade out
        logoVideo.addEventListener('ended', function() {
            setTimeout(() => {
                hideOpeningScreen();
            }, 1000);
        });
        
        // If video fails to load, still hide after timeout
        logoVideo.addEventListener('error', function() {
            console.log('Video failed to load, using fallback');
            setTimeout(() => {
                hideOpeningScreen();
            }, 1000);
        });
    }
    
    setTimeout(() => {
        hideOpeningScreen();
    }, 1000);
}

function hideOpeningScreen() {
    const openingScreen = document.getElementById('opening-screen');
    if (openingScreen && !openingScreen.classList.contains('fade-out')) {
        openingScreen.classList.add('fade-out');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            openingScreen.remove();
        }, 500);
    }
}

// Enhanced version with skip functionality
function initOpeningScreenWithSkip() {
    const openingScreen = document.getElementById('opening-screen');
    const logoVideo = document.querySelector('.logo-video');
    
    if (!openingScreen) return;
    
    // Add skip button
    const skipButton = document.createElement('button');
    skipButton.innerHTML = 'Skip';
    skipButton.className = 'skip-button';
    skipButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s;
    `;
    skipButton.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.9)'; };
    skipButton.onmouseout = function() { this.style.background = 'rgba(0,0,0,0.7)'; };
    skipButton.onclick = hideOpeningScreen;
    
    openingScreen.appendChild(skipButton);
    
    // Video event handlers
    if (logoVideo) {
        logoVideo.addEventListener('loadeddata', function() {
            console.log('Video loaded successfully');
        });
        
        logoVideo.addEventListener('ended', function() {
            setTimeout(hideOpeningScreen, 800);
        });
        
        logoVideo.addEventListener('error', function() {
            console.log('Video error, using image fallback');
            // Show fallback image
            const fallbackImg = this.querySelector('img');
            if (fallbackImg) {
                this.style.display = 'none';
                fallbackImg.style.display = 'block';
            }
            setTimeout(hideOpeningScreen, 1000);
        });
        
        // Try to play video
        logoVideo.play().catch(error => {
            console.log('Video autoplay failed:', error);
            // Still hide after timeout
            setTimeout(hideOpeningScreen, 3000);
        });
    }
    
    // Maximum timeout as fallback
    setTimeout(hideOpeningScreen, 2000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initOpeningScreenWithSkip();
});

// Alternative: Show opening screen only on first visit
function initOpeningScreenFirstVisit() {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('irctc_visited');
    
    if (!hasVisited) {
        // First visit - show opening screen
        initOpeningScreenWithSkip();
        // Mark as visited
        localStorage.setItem('irctc_visited', 'true');
    } else {
        // Returning visitor - hide immediately
        const openingScreen = document.getElementById('opening-screen');
        if (openingScreen) {
            openingScreen.style.display = 'none';
            openingScreen.remove();
        }
    }
}

// Mock API Configuration
const MOCK_API = {
    baseURL: "https://mock-irctc-api.com/v1",
    endpoints: {
        login: "/auth/login",
        signup: "/auth/signup",
        pnrStatus: "/pnr/status",
        searchTrains: "/trains/search",
        bookTicket: "/booking/create"
    },
    // Mock API Key (for demonstration only)
    apiKey: "irctc_mock_2025_hackathon_7x9k2m4p6q8r"
};

// Mock Database
const MOCK_DB = {
    users: [
        { id: 1, username: "demo123", mobile: "9876543210", email: "demo@example.com", password: "Demo@123", name: "Demo User" }
    ],
    pnrRecords: [
        { pnr: "1234567890", status: "CNF", coach: "S2", seat: "45", train: "12020 SHATABDI EXP" },
        { pnr: "2345678901", status: "WL", waitlist: "15", train: "12952 RAJDHANI EXP" }
    ],
    trains: [
        { number: "12020", name: "SHATABDI EXP", from: "NDLS", to: "LKO", classes: ["CC", "EC"] },
        { number: "12952", name: "RAJDHANI EXP", from: "NDLS", to: "CSMT", classes: ["3A", "2A", "1A"] }
    ]
};

// --- Custom Message Box Functions ---
const messageBox = document.getElementById('custom-message-box');
const messageText = document.getElementById('message-text');

function showMessageBox(message) {
    messageText.textContent = message;
    messageBox.style.display = 'flex';
}

function hideMessageBox() {
    messageBox.style.display = 'none';
}

// --- Mock API Functions ---
function mockApiCall(endpoint, data = {}, delay = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let response;
            
            switch(endpoint) {
                case MOCK_API.endpoints.login:
                    response = handleLoginAPI(data);
                    break;
                case MOCK_API.endpoints.signup:
                    response = handleSignupAPI(data);
                    break;
                case MOCK_API.endpoints.pnrStatus:
                    response = handlePnrAPI(data);
                    break;
                case MOCK_API.endpoints.searchTrains:
                    response = handleTrainSearchAPI(data);
                    break;
                default:
                    response = { success: false, message: "Invalid endpoint" };
            }
            
            if (response.success) {
                resolve(response);
            } else {
                reject(response);
            }
        }, delay);
    });
}

function handleLoginAPI(data) {
    const { username, password } = data;
    const user = MOCK_DB.users.find(u => 
        (u.username === username || u.mobile === username) && u.password === password
    );
    
    if (user) {
        return {
            success: true,
            message: "Login successful",
            data: {
                userId: user.id,
                name: user.name,
                token: "mock_jwt_token_" + Date.now()
            }
        };
    } else {
        return {
            success: false,
            message: "Invalid credentials"
        };
    }
}

function handleSignupAPI(data) {
    const { mobile, email, firstName, lastName, password } = data;
    
    // Check if user already exists
    const existingUser = MOCK_DB.users.find(u => u.mobile === mobile || u.email === email);
    if (existingUser) {
        return {
            success: false,
            message: "User with this mobile or email already exists"
        };
    }
    
    // Create new user
    const newUser = {
        id: MOCK_DB.users.length + 1,
        username: "user" + Date.now(),
        mobile,
        email,
        password,
        name: `${firstName} ${lastName}`
    };
    
    MOCK_DB.users.push(newUser);
    
    return {
        success: true,
        message: "Account created successfully",
        data: {
            userId: newUser.id,
            username: newUser.username
        }
    };
}

function handlePnrAPI(data) {
    const { pnr } = data;
    const record = MOCK_DB.pnrRecords.find(r => r.pnr === pnr);
    
    if (record) {
        return {
            success: true,
            message: "PNR status fetched successfully",
            data: record
        };
    } else {
        return {
            success: false,
            message: "PNR not found"
        };
    }
}

function handleTrainSearchAPI(data) {
    const { from, to, date } = data;
    
    // Filter trains based on route (mock implementation)
    const availableTrains = MOCK_DB.trains.filter(train => 
        train.from === from && train.to === to
    );
    
    return {
        success: true,
        message: "Trains fetched successfully",
        data: {
            trains: availableTrains,
            searchParams: { from, to, date }
        }
    };
}

// --- Auth Modal Functionality ---
const authModal = document.getElementById('auth-modal');

function showAuthModal() {
    authModal.style.display = 'flex';
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    document.getElementById('login-captcha').textContent = currentCaptchas.login;
    document.getElementById('signup-captcha').textContent = currentCaptchas.signup;
}

function hideAuthModal() {
    authModal.style.display = 'none';
}

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function refreshCaptcha(type) {
    currentCaptchas[type] = generateCaptcha();
    document.getElementById(`${type}-captcha`).textContent = currentCaptchas[type];
    document.getElementById(`${type}-captcha-input`).value = '';
}

// Switch between login and signup tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const tabType = this.getAttribute('data-tab');
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabType}-form`).classList.add('active');
    });
});


function handleLogin(event) {
    event.preventDefault(); // Stop the form from submitting normally
    
    // 1. Get Input Values
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const captchaInput = document.getElementById('login-captcha-input').value;

    // 2. Captcha Validation
    if (captchaInput !== currentCaptchas['login']) {
        showMessageBox("Login Failed: Incorrect Captcha. Please try again.", "fas fa-shield-alt", 'var(--error-color)');
        refreshCaptcha('login'); // Generate a new captcha on failure
        return;
    }

    // 3. Credential Validation (Simulated)
    // Use 'demo' / 'demo' for successful login
    if (username === 'demo' && password === 'demo') {
        showMessageBox("Login Successful! Welcome, Demo User. 🥳", "fas fa-check-circle", 'var(--success-color)');
        hideAuthModal(); // Hide the modal on success
        
        // Clear inputs after successful login
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('login-captcha-input').value = '';

    } else {
        // Real-world: This would check a server database
        showMessageBox("Login Failed: Invalid User ID or Password.", "fas fa-lock", 'var(--error-color)');
        refreshCaptcha('login'); // Generate a new captcha on failure
    }
}

function fillDemoCredentials() {
    document.getElementById('login-username').value = 'demo';
    document.getElementById('login-password').value = 'demo';
    showMessageBox("Demo credentials filled. Please enter the Captcha to login.", "fas fa-fingerprint", 'var(--accent-color)');
}

function showForgotPassword() {
    showMessageBox("Password reset process initiated. Check your registered mobile/email (Simulation).", "fas fa-envelope", 'var(--accent-color)');
}

function showForgotUsername() {
    showMessageBox("User ID recovery process initiated. Check your registered mobile/email (Simulation).", "fas fa-id-badge", 'var(--accent-color)');
}

// Utility functions for the modal itself (if not already present)
function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

//new code uptil here

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const mobile = document.getElementById('signup-mobile').value;
    const email = document.getElementById('signup-email').value;
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const captchaInput = document.getElementById('signup-captcha-input').value;
    const expectedCaptcha = currentCaptchas.signup;
    
    // Validation
    if (!mobile || !email || !firstName || !lastName || !password || !confirmPassword || !captchaInput) {
        showMessageBox("Please fill in all fields.");
        return;
    }
    
    if (mobile.length !== 10) {
        showMessageBox("Please enter a valid 10-digit mobile number.");
        return;
    }
    
    if (password !== confirmPassword) {
        showMessageBox("Passwords do not match.");
        return;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        showMessageBox("Password must be at least 8 characters with uppercase, lowercase, number and special character.");
        return;
    }
    
    if (captchaInput !== expectedCaptcha) {
        showMessageBox("Invalid captcha. Please try again.");
        refreshCaptcha('signup');
        return;
    }
    
    try {
        const signupBtn = document.querySelector('#signup-form .auth-submit');
        const originalText = signupBtn.textContent;
        signupBtn.textContent = "Creating Account...";
        signupBtn.disabled = true;
        
        const response = await mockApiCall(MOCK_API.endpoints.signup, {
            mobile, email, firstName, lastName, password
        });
        
        showMessageBox(`Account created successfully! Your username is: ${response.data.username}`);
        
        // Switch to login tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="login"]').classList.add('active');
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById('login-form').classList.add('active');
        
    } catch (error) {
        showMessageBox(error.message);
        refreshCaptcha('signup');
    } finally {
        const signupBtn = document.querySelector('#signup-form .auth-submit');
        signupBtn.textContent = "Create Account";
        signupBtn.disabled = false;
    }
}

// Forgot password/username handlers
function showForgotPassword() {
    showMessageBox("Password reset feature would be implemented here. In real implementation, OTP would be sent to registered mobile/email.");
}

function showForgotUsername() {
    showMessageBox("Username recovery feature would be implemented here. You would need to verify your mobile number or email.");
}

function fillDemoCredentials() {
    const demoUser = MOCK_DB.users[0];
    document.getElementById('login-username').value = demoUser.username;
    document.getElementById('login-password').value = demoUser.password;
    document.getElementById('login-captcha-input').value = currentCaptchas.login;
    showMessageBox("Demo credentials filled. Click Login to continue.");
}

// --- Lite Mode Toggle Functionality ---
function toggleLiteMode() {
    document.body.classList.toggle('lite-mode');
    const buttonText = document.getElementById('lite-mode-toggle');
    const liteCalloutBtn = document.querySelector('.btn-lite-mode');
    
    if (document.body.classList.contains('lite-mode')) {
        showMessageBox("Lite Mode Activated: Minimal CSS, no background image, reduced animations.");
        buttonText.textContent = "Exit Lite Mode";
        if (liteCalloutBtn) liteCalloutBtn.innerHTML = '<i class="fas fa-bolt"></i> Exit Lite Mode';
    } else {
        showMessageBox("Lite Mode Deactivated.");
        buttonText.textContent = "Lite Mode";
        if (liteCalloutBtn) liteCalloutBtn.innerHTML = '<i class="fas fa-bolt"></i> Switch to Lite Mode (Save Data & Go Faster)';
    }
}

// Attach function to navbar link
document.getElementById('lite-mode-toggle').addEventListener('click', toggleLiteMode);

// --- AI Chatbot Functionality ---
const chatbotBtn = document.getElementById("chatbot-btn");
const chatWindow = document.getElementById("chat-window");
const closeChat = document.getElementById("close-chat");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

// Toggle chatbot window
chatbotBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
});

closeChat.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
});

// Send message
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user");
    userInput.value = "";

    setTimeout(() => {
        addMessage(generateBotReply(message), "bot");
    }, 600);
}

function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "user" ? "user-msg" : "bot-msg");
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple AI Replies
function generateBotReply(message) {
    const lower = message.toLowerCase();

    if (lower.includes("hello") || lower.includes("hi"))
        return "Hello there! How can I assist you with your IRCTC booking?";
    if (lower.includes("ticket") || lower.includes("book"))
        return "You can book tickets directly on the homepage — just enter your source, destination, and date.";
    if (lower.includes("pnr"))
        return "To check your PNR status, use the PNR section above the popular routes.";
    if (lower.includes("refund"))
        return "Refunds are processed within 3–5 working days depending on your payment method.";
    if (lower.includes("cancel"))
        return "You can cancel your ticket by logging into your IRCTC account and visiting 'My Bookings'.";
    if (lower.includes("train") || lower.includes("schedule"))
        return "You can check train schedules and availability using the booking form on the homepage.";
    if (lower.includes("help"))
        return "I can help you with tickets, refunds, PNR, cancellations, train schedules, and more!";
    if (lower.includes("thank"))
        return "You're welcome! Is there anything else I can help you with?";
    return "I'm here to assist with IRCTC services! Try asking about tickets, refunds, PNR status, or train schedules.";
}

function toggleAIChatbot() {
    chatWindow.classList.toggle("hidden");
}

// --- PNR Status Check Functionality ---
async function checkPNRStatus() {
    const pnrInput = document.getElementById('pnr-number');
    const pnrResult = document.getElementById('pnr-result');
    const pnr = pnrInput.value;

    if (pnr.length !== 10 || isNaN(pnr)) {
        showMessageBox("Please enter a valid 10-digit PNR number.");
        pnrResult.innerHTML = '';
        pnrResult.classList.remove('pnr-success', 'pnr-error');
        return;
    }

    try {
        pnrResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking status...';
        pnrResult.classList.remove('pnr-success', 'pnr-error');
        
        const response = await mockApiCall(MOCK_API.endpoints.pnrStatus, { pnr }, 1500);
        
        const record = response.data;
        let statusHtml = '';
        
        if (record.status === 'CNF') {
            statusHtml = `<i class="fas fa-check-circle"></i> Status: <strong>CONFIRMED</strong><br>
                         Coach: ${record.coach}, Seat: ${record.seat}<br>
                         Train: ${record.train}`;
            pnrResult.classList.add('pnr-success');
        } else if (record.status === 'WL') {
            statusHtml = `<i class="fas fa-exclamation-triangle"></i> Status: <strong>WAITING LIST (WL ${record.waitlist})</strong><br>
                         Train: ${record.train}`;
            pnrResult.classList.add('pnr-error');
        } else {
            statusHtml = `<i class="fas fa-info-circle"></i> Status: ${record.status}<br>
                         Train: ${record.train}`;
            pnrResult.classList.add('pnr-error');
        }
        
        pnrResult.innerHTML = statusHtml;
        
    } catch (error) {
        pnrResult.innerHTML = `<i class="fas fa-times-circle"></i> ${error.message}`;
        pnrResult.classList.add('pnr-error');
    }
}

// Booking Modal JavaScript

// Global Variables
let currentBookingStep = 1;
let selectedClassData = null;
let passengerCount = 2;
let bookingData = {
    from: 'NDLS',
    to: 'LKO',
    date: '2025-10-30',
    trainNumber: '12020',
    trainName: 'SHATABDI EXPRESS',
    selectedClass: null,
    selectedFare: 0,
    passengers: [],
    contactDetails: {},
    paymentMethod: null
};

// Show Booking Modal
function showBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Get search form values if available
    const fromStation = document.getElementById('from-station')?.value || 'NDLS';
    const toStation = document.getElementById('to-station')?.value || 'LKO';
    const travelDate = document.getElementById('travel-date')?.value || '2025-10-30';
    
    // Update booking data
    bookingData.from = fromStation;
    bookingData.to = toStation;
    bookingData.date = travelDate;
    
    // Update route display
    document.getElementById('route-display').textContent = `${fromStation} → ${toStation}`;
    document.getElementById('step1-from').textContent = fromStation;
    document.getElementById('step1-to').textContent = toStation;
    document.getElementById('step1-date').textContent = travelDate;
    
    // Reset to step 1
    proceedToStep(1);
}

// Hide Booking Modal
function hideBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Reset all data
    resetBookingModal();
}

// Reset Booking Modal
function resetBookingModal() {
    currentBookingStep = 1;
    selectedClassData = null;
    passengerCount = 2;
    
    // Clear all form inputs
    document.querySelectorAll('.booking-step input, .booking-step select').forEach(input => {
        input.value = '';
    });
    
    // Uncheck all checkboxes and radios
    document.querySelectorAll('.booking-step input[type="checkbox"], .booking-step input[type="radio"]').forEach(input => {
        input.checked = false;
    });
    
    // Remove selected class from buttons
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = btn.dataset.class === '2A' ? 'Waitlist' : 'Select';
    });
    
    // Remove selected payment method
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Hide payment details
    document.querySelectorAll('.payment-details').forEach(details => {
        details.style.display = 'none';
    });
}

// Proceed to Step
function proceedToStep(step) {
    // Validation before proceeding
    if (step === 2 && !validateStep1()) return;
    if (step === 3 && !validateStep2()) return;
    
    currentBookingStep = step;
    
    // Update progress indicators
    updateProgressIndicators(step);
    
    // Show/hide steps
    document.querySelectorAll('.booking-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    document.getElementById(`booking-step-${step}`).classList.add('active');
    
    // Update step 2 display if moving to step 2
    if (step === 2) {
        updateStep2Display();
    }
    
    // Update step 3 display if moving to step 3
    if (step === 3) {
        updateStep3Display();
    }
    
    // Scroll to top of modal
    document.querySelector('.booking-modal-content').scrollTop = 0;
}

// Update Progress Indicators
function updateProgressIndicators(currentStep) {
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`progress-step-${i}`);
        stepEl.classList.remove('active', 'completed');
        
        if (i < currentStep) {
            stepEl.classList.add('completed');
        } else if (i === currentStep) {
            stepEl.classList.add('active');
        }
    }
}

// Select Class
function selectClass(className, fare) {
    selectedClassData = { class: className, fare: fare };
    bookingData.selectedClass = className;
    bookingData.selectedFare = fare;
    
    // Update button states
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.classList.remove('selected');
        const originalText = btn.dataset.class === '2A' ? 'Waitlist' : 'Select';
        btn.textContent = originalText;
    });
    
    // Mark selected button
    const selectedBtn = document.querySelector(`.btn-select[data-class="${className}"]`);
    selectedBtn.classList.add('selected');
    selectedBtn.textContent = 'Selected ✓';
}

// Validate Step 1
function validateStep1() {
    if (!selectedClassData) {
        alert('Please select a class before proceeding.');
        return false;
    }
    return true;
}

// Update Step 2 Display
function updateStep2Display() {
    document.getElementById('selected-class-display').textContent = selectedClassData.class;
    document.getElementById('selected-fare-display').textContent = selectedClassData.fare;
}

// Validate Step 2
function validateStep2() {
    // Validate contact details
    const mobile = document.getElementById('contact-mobile').value;
    const email = document.getElementById('contact-email').value;
    
    if (!mobile || mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        document.getElementById('contact-mobile').focus();
        return false;
    }
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        document.getElementById('contact-email').focus();
        return false;
    }
    
    // Validate passenger details
    let allValid = true;
    const passengers = [];
    
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passenger${i}-name`);
        const age = document.getElementById(`passenger${i}-age`);
        const gender = document.getElementById(`passenger${i}-gender`);
        
        if (!name || !name.value.trim()) {
            alert(`Please enter name for Passenger ${i}`);
            name?.focus();
            return false;
        }
        
        if (!age || !age.value || age.value < 1 || age.value > 120) {
            alert(`Please enter valid age for Passenger ${i}`);
            age?.focus();
            return false;
        }
        
        if (!gender || !gender.value) {
            alert(`Please select gender for Passenger ${i}`);
            gender?.focus();
            return false;
        }
        
        passengers.push({
            name: name.value,
            age: age.value,
            gender: gender.value,
            berth: document.getElementById(`passenger${i}-berth`)?.value || ''
        });
    }
    
    // Store data
    bookingData.contactDetails = { mobile, email };
    bookingData.passengers = passengers;
    
    return true;
}

// Update Step 3 Display
function updateStep3Display() {
    const totalPassengers = bookingData.passengers.length;
    const baseFare = selectedClassData.fare * totalPassengers;
    const convenienceFee = totalPassengers * 20; // ₹20 per passenger
    const totalAmount = baseFare + convenienceFee;
    
    // Update summary
    document.getElementById('summary-from').textContent = bookingData.from;
    document.getElementById('summary-to').textContent = bookingData.to;
    document.getElementById('summary-date').textContent = bookingData.date;
    document.getElementById('summary-class').textContent = selectedClassData.class;
    document.getElementById('summary-passengers').textContent = totalPassengers;
    document.getElementById('summary-base-fare').textContent = baseFare.toLocaleString('en-IN');
    document.getElementById('summary-convenience-fee').textContent = convenienceFee.toLocaleString('en-IN');
    document.getElementById('summary-total').textContent = totalAmount.toLocaleString('en-IN');
    document.getElementById('final-amount').textContent = totalAmount.toLocaleString('en-IN');
}

// Select Payment Method
function selectPaymentMethod(method) {
    bookingData.paymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`.payment-option[data-method="${method}"]`).classList.add('selected');
    document.getElementById(`payment-${method}`).checked = true;
    
    // Show corresponding payment details form
    document.querySelectorAll('.payment-details').forEach(details => {
        details.style.display = 'none';
    });
    
    const detailsForm = document.getElementById(`payment-details-${method}`);
    if (detailsForm) {
        detailsForm.style.display = 'block';
    }
}

// Add Passenger
function addPassenger() {
    if (passengerCount >= 6) {
        alert('Maximum 6 passengers allowed per booking.');
        return;
    }
    
    passengerCount++;
    const passengersSection = document.querySelector('.passengers-section');
    const addButton = document.querySelector('.btn-add-passenger');
    
    const newPassengerHTML = `
        <div class="passenger-card" id="passenger-card-${passengerCount}">
            <div class="passenger-header">
                Passenger ${passengerCount}
                <button type="button" class="btn-remove-passenger" onclick="removePassenger(${passengerCount})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger${passengerCount}-name">Full Name *</label>
                    <input type="text" id="passenger${passengerCount}-name" class="form-control" 
                           placeholder="As per ID proof" required>
                </div>
                <div class="form-group">
                    <label for="passenger${passengerCount}-age">Age *</label>
                    <input type="number" id="passenger${passengerCount}-age" class="form-control" 
                           placeholder="Age" min="1" max="120" required>
                </div>
                <div class="form-group">
                    <label for="passenger${passengerCount}-gender">Gender *</label>
                    <select id="passenger${passengerCount}-gender" class="form-control" required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger${passengerCount}-berth">Berth Preference</label>
                    <select id="passenger${passengerCount}-berth" class="form-control">
                        <option value="">No Preference</option>
                        <option value="lower">Lower</option>
                        <option value="middle">Middle</option>
                        <option value="upper">Upper</option>
                        <option value="side-lower">Side Lower</option>
                        <option value="side-upper">Side Upper</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    addButton.insertAdjacentHTML('beforebegin', newPassengerHTML);
}

// Remove Passenger
function removePassenger(passengerNum) {
    if (passengerCount <= 1) {
        alert('At least one passenger is required.');
        return;
    }
    
    const passengerCard = document.getElementById(`passenger-card-${passengerNum}`);
    if (passengerCard) {
        passengerCard.remove();
        passengerCount--;
        
        // Renumber remaining passengers
        renumberPassengers();
    }
}

// Renumber Passengers
function renumberPassengers() {
    const passengerCards = document.querySelectorAll('.passenger-card');
    passengerCards.forEach((card, index) => {
        const passengerNumber = index + 1;
        card.id = `passenger-card-${passengerNumber}`;
        
        const header = card.querySelector('.passenger-header');
        const removeButton = header.querySelector('.btn-remove-passenger');
        
        header.childNodes[0].textContent = `Passenger ${passengerNumber} `;
        
        if (removeButton) {
            removeButton.onclick = () => removePassenger(passengerNumber);
        }
        
        // Update input IDs
        const inputs = card.querySelectorAll('input, select');
        inputs.forEach(input => {
            const oldId = input.id;
            const newId = oldId.replace(/passenger\d+/, `passenger${passengerNumber}`);
            input.id = newId;
            
            const label = card.querySelector(`label[for="${oldId}"]`);
            if (label) {
                label.setAttribute('for', newId);
            }
        });
    });
    
    passengerCount = passengerCards.length;
}

// Make Payment
function makePayment() {
    // Validate payment method selected
    if (!bookingData.paymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    // Validate terms acceptance
    const termsAccepted = document.getElementById('accept-terms').checked;
    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to proceed.');
        return;
    }
    
    // Validate payment details based on method
    if (!validatePaymentDetails()) {
        return;
    }
    
    // Show loading state
    const payButton = document.querySelector('.btn-success');
    const originalText = payButton.innerHTML;
    payButton.innerHTML = '<span class="booking-loader"></span> Processing...';
    payButton.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Generate random PNR
        const pnr = generatePNR();
        
        // Show success message
        showBookingSuccess(pnr);
        
        // Reset button
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    }, 2000);
}

// Validate Payment Details
function validatePaymentDetails() {
    const method = bookingData.paymentMethod;
    
    if (method === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCVV = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
            alert('Please enter a valid card number.');
            document.getElementById('card-number').focus();
            return false;
        }
        
        if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
            alert('Please enter expiry date in MM/YY format.');
            document.getElementById('card-expiry').focus();
            return false;
        }
        
        if (!cardCVV || cardCVV.length < 3) {
            alert('Please enter a valid CVV.');
            document.getElementById('card-cvv').focus();
            return false;
        }
        
        if (!cardName || cardName.trim().length < 3) {
            alert('Please enter cardholder name.');
            document.getElementById('card-name').focus();
            return false;
        }
    } else if (method === 'netbanking') {
        const bank = document.getElementById('bank-select').value;
        if (!bank) {
            alert('Please select your bank.');
            document.getElementById('bank-select').focus();
            return false;
        }
    } else if (method === 'upi') {
        const upiId = document.getElementById('upi-id').value;
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID.');
            document.getElementById('upi-id').focus();
            return false;
        }
    } else if (method === 'wallet') {
        const wallet = document.getElementById('wallet-select').value;
        if (!wallet) {
            alert('Please select a wallet.');
            document.getElementById('wallet-select').focus();
            return false;
        }
    }
    
    return true;
}

// Generate PNR
function generatePNR() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Show Booking Success
function showBookingSuccess(pnr) {
    const modal = document.querySelector('.booking-modal-content');
    
    const successHTML = `
        <div class="booking-success">
            <i class="fas fa-check-circle"></i>
            <h3>Booking Confirmed!</h3>
            <p>Your ticket has been booked successfully.</p>
            <div class="pnr-number">${pnr}</div>
            <p><strong>PNR Number</strong></p>
            <p>Train: ${bookingData.trainNumber} ${bookingData.trainName}</p>
            <p>Journey: ${bookingData.from} → ${bookingData.to}</p>
            <p>Date: ${bookingData.date}</p>
            <p>Class: ${bookingData.selectedClass}</p>
            <p>Passengers: ${bookingData.passengers.length}</p>
            <p style="margin-top: 20px;">
                E-ticket has been sent to:<br>
                <strong>${bookingData.contactDetails.email}</strong><br>
                <strong>${bookingData.contactDetails.mobile}</strong>
            </p>
            <button class="btn btn-primary" onclick="hideBookingModal()" style="margin-top: 30px;">
                <i class="fas fa-check"></i> Done
            </button>
        </div>
    `;
    
    modal.innerHTML = successHTML;
}

// Format Card Number
document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("travel-date"); // 👈 correct ID

    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format Expiry Date
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('booking-modal');
    if (event.target === modal) {
        hideBookingModal();
    }
};

// ESC key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('booking-modal');
        if (modal && modal.style.display === 'flex') {
            hideBookingModal();
        }
    }
});
