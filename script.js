// Authentication check
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (!data.authenticated && !window.location.pathname.includes('index.html')) {
            window.location.href = '../index.html';
            return false;
        }
        
        if (data.authenticated) {
            // Store user data in localStorage for quick access
            localStorage.setItem('userData', JSON.stringify(data.user));
            return data.user;
        }
        
        return false;
    } catch (error) {
        console.error('Auth check failed:', error);
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = '../index.html';
        }
        return false;
    }
}

// Profile Menu Functionality
function initializeProfileMenu() {
    const profileWrapper = document.getElementById('profile-wrapper');
    const subMenu = document.getElementById('subMenu');
    const logoutLink = document.getElementById('logout-link');

    if (!profileWrapper || !subMenu) return;

    // Toggle dropdown on trigger click
    profileWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        subMenu.classList.toggle('open-menu');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileWrapper.contains(e.target)) {
            subMenu.classList.remove('open-menu');
        }
    });

    // Handle logout
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (!data.authenticated) return;
        
        const userData = data.user;
        const headerProfileImg = document.getElementById('header-profile-img');
        const headerProfileName = document.getElementById('header-profile-name');
        const userName = document.getElementById('user-name');

        if (headerProfileImg) {
            if (userData.profile_picture) {
                headerProfileImg.src = userData.profile_picture.startsWith('/') ? 
                    userData.profile_picture : '/' + userData.profile_picture;
            } else {
                // Use Font Awesome user icon as default profile picture
                headerProfileImg.style.backgroundColor = '#e0e0e0';
                headerProfileImg.style.padding = '8px';
                headerProfileImg.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>');
            }
        }
        
        if (headerProfileName) {
            headerProfileName.textContent = userData.name;
        }
        
        if (userName) {
            userName.textContent = userData.name;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Handle logout with server-side session cleanup
async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkAuth();
    if (!userData) return;

    await loadUserProfile();
    initializeProfileMenu();
});

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const registerBox = document.getElementById('register-box');
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const logoutBtn = document.getElementById('logout-btn');
const reportForm = document.getElementById('report-form');
const noticeForm = document.getElementById('notice-form');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Event Listeners
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-box').classList.add('hidden');
    registerBox.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.classList.add('hidden');
    document.querySelector('.auth-box').classList.remove('hidden');
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
reportForm.addEventListener('submit', handleReportFound);
noticeForm.addEventListener('submit', handleIssueNotice);
navButtons.forEach(btn => btn.addEventListener('click', handleNavigation));
searchInput.addEventListener('input', handleSearch);
categoryFilter.addEventListener('change', handleSearch);

// Navigation
async function handleNavigation(e) {
    e.preventDefault();
    const targetPage = e.target.dataset.page;
    
    // Update active states
    navButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(`${targetPage}-page`).classList.add('active');
    
    // Reload user profile
    await loadUserProfile();
    
    // Load page specific content
    if (targetPage === 'find') {
        loadAllFoundItems();
    }
}

// Load all found items
async function loadAllFoundItems() {
    try {
        const response = await fetch('/api/found-items');
        const items = await response.json();
        displayFoundItems(items, 'search-results');
    } catch (error) {
        console.error('Error loading found items:', error);
    }
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const registration_no = document.getElementById('registration_no').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Attempting login for user:', registration_no);
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registration_no, password }),
            credentials: 'include' // Important for session cookies
        });

        const data = await response.json();
        console.log('Login response:', response.status, data);

        if (response.ok) {
            console.log('Login successful, updating UI');
            // Store user data in localStorage for quick access
            localStorage.setItem('userData', JSON.stringify(data.user));
            // Update UI
            document.getElementById('user-name').textContent = data.user.name;
            authContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            // Redirect to home page
            window.location.href = '/pages/home.html';
        } else {
            console.error('Login failed:', data.error);
            alert(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your connection and try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLoginLink.click();
            loginForm.reset();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [foundItems, notices] = await Promise.all([
            fetch('/api/found-items').then(res => res.json()),
            fetch('/api/lost-notices').then(res => res.json())
        ]);

        displayFoundItems(foundItems.slice(0, 5), 'recent-found');
        displayNotices(notices.slice(0, 5), 'recent-notices');
    } catch (error) {
        console.error('Dashboard loading error:', error);
    }
}

// Found Items
async function handleReportFound(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', document.getElementById('item-description').value);
    formData.append('location', document.getElementById('item-location').value);
    formData.append('category', document.getElementById('item-category').value);
    formData.append('image', document.getElementById('item-image').files[0]);

    try {
        const response = await fetch('/api/report-found', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            alert('Item reported successfully!');
            reportForm.reset();
            loadDashboard();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Report error:', error);
        alert('Failed to report item. Please try again.');
    }
}

// Lost Notices
async function handleIssueNotice(e) {
    e.preventDefault();
    const description = document.getElementById('notice-description').value;
    const location = document.getElementById('notice-location').value;
    const contactInfo = document.getElementById('notice-contact').value;

    try {
        const response = await fetch('/api/issue-notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, location, contact_info: contactInfo })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Notice issued successfully!');
            noticeForm.reset();
            loadDashboard();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Notice error:', error);
        alert('Failed to issue notice. Please try again.');
    }
}

// Search
async function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    try {
        const response = await fetch('/api/found-items');
        const items = await response.json();
        
        if (!searchTerm && !category) {
            displayFoundItems(items, 'search-results');
            return;
        }
        
        const filteredItems = items.filter(item => {
            const matchesSearch = item.description.toLowerCase().includes(searchTerm) ||
                                item.location.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || item.category === category;
            return matchesSearch && matchesCategory;
        });

        displayFoundItems(filteredItems, 'search-results');
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display Functions
function displayFoundItems(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        const content = document.createElement('div');
        content.className = 'card-content';
        
        content.innerHTML = `
            <h4>${item.description}</h4>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Status:</strong> ${item.status || 'available'}</p>
            <p><strong>Date:</strong> ${new Date(item.created_at).toLocaleDateString()}</p>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const claimButton = document.createElement('button');
        claimButton.className = 'card-button';
        claimButton.textContent = 'Claim it';
        
        actions.appendChild(claimButton);
        card.appendChild(content);
        card.appendChild(actions);
        container.appendChild(card);
    });
}

function displayNotices(notices, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    notices.forEach(notice => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        const content = document.createElement('div');
        content.className = 'card-content';
        
        content.innerHTML = `
            <h4>${notice.description}</h4>
            <p><strong>Location:</strong> ${notice.location}</p>
            <p><strong>Contact:</strong> ${notice.contact_info}</p>
            <p><strong>Status:</strong> ${notice.status || 'active'}</p>
            <p><strong>Date:</strong> ${new Date(notice.created_at).toLocaleDateString()}</p>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const foundButton = document.createElement('button');
        foundButton.className = 'card-button';
        foundButton.textContent = 'Found it';
        
        actions.appendChild(foundButton);
        card.appendChild(content);
        card.appendChild(actions);
        container.appendChild(card);
    });
}

// Handle button clicks
async function handleClaim(itemId) {
    if (confirm('Are you sure you want to claim this item? This will notify the finder.')) {
        try {
            const response = await fetch(`/api/claim-item/${itemId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            if (response.ok) {
                alert('Claim submitted successfully! The finder will be notified.');
                loadDashboard(); // Refresh the dashboard
            } else {
                alert(data.error || 'Failed to claim item');
            }
        } catch (error) {
            console.error('Error claiming item:', error);
            alert('Failed to claim item. Please try again.');
        }
    }
}

async function handleFound(noticeId) {
    if (confirm('Have you found this item? This will notify the owner.')) {
        try {
            const response = await fetch(`/api/found-notice/${noticeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            if (response.ok) {
                alert('Thank you! The owner will be notified.');
                loadDashboard(); // Refresh the dashboard
            } else {
                alert(data.error || 'Failed to submit found notification');
            }
        } catch (error) {
            console.error('Error submitting found notification:', error);
            alert('Failed to submit found notification. Please try again.');
        }
    }
}

// Popup functionality
function showPopup(content) {
    const popup = document.getElementById('item-details-popup');
    if (popup) {
        popup.querySelector('.popup-content').innerHTML = content;
        popup.style.display = 'block';
    }
}

function closePopup() {
    const popup = document.getElementById('item-details-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Close popup when clicking outside
document.addEventListener('click', function(e) {
    const popup = document.getElementById('item-details-popup');
    if (popup && e.target === popup) {
        popup.style.display = 'none';
    }
});

// Contact popup functionality
function showContactPopup(userData, item) {
    const popupContent = `
        <div class="popup-header">
            <h3>Contact Details</h3>
            <button class="close-popup">&times;</button>
        </div>
        <div class="popup-body">
            <div class="contact-info">
                <p><strong>Name: </strong><span id="popup-name">${userData.name}</span></p>
                <p><strong>Contact: </strong><span id="popup-contact">${userData.mobile_no}</span></p>
                <p><strong>Item: </strong><span id="popup-item">${item.subject}</span></p>
                <p><strong>Location: </strong><span id="popup-location">${item.found_location || 'Not specified'}</span></p>
            </div>
        </div>
    `;
    
    const popup = document.getElementById('contact-popup');
    if (popup) {
        popup.querySelector('.popup-content').innerHTML = popupContent;
        popup.style.display = 'block';
        
        // Add event listener for close button
        const closeBtn = popup.querySelector('.close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.style.display = 'none';
            });
        }
    }
}

// Close contact popup when clicking outside
document.addEventListener('click', function(e) {
    const popup = document.getElementById('contact-popup');
    if (popup && e.target === popup) {
        popup.style.display = 'none';
    }
}); 