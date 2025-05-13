document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    fetch('/api/check-auth')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/';
            } else {
                // Set profile image with default fallback
                const profileImg = document.getElementById('header-profile-img');
                if (data.user.profile_picture) {
                    profileImg.src = data.user.profile_picture.startsWith('/') ? data.user.profile_picture : '/' + data.user.profile_picture;
                } else {
                    // Use Font Awesome user icon as default profile picture
                    profileImg.style.backgroundColor = '#e0e0e0';
                    profileImg.style.padding = '8px';
                    profileImg.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>');
                }
                document.getElementById('header-profile-name').textContent = data.user.name;
            }
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        });

    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const searchResults = document.getElementById('search-results');

    // Function to load and display items
    const loadItems = async (searchTerm = '', category = '') => {
        try {
            // Build the query URL
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (category) queryParams.append('category_id', category);

            const url = `/api/found-items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url);
            const items = await response.json();
            
            if (items.length === 0) {
                searchResults.innerHTML = '<p class="text-center">No items found matching your search criteria.</p>';
                return;
            }

            searchResults.innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="item-content">
                        <h4 class="item-subject">${item.subject}</h4>
                        <p><strong>Location:</strong> ${item.found_location || 'Not specified'}</p>
                        <p><strong>Category:</strong> ${getCategoryName(item.category_id)}</p>
                        <p><strong>Found on:</strong> ${new Date(item.created_at).toLocaleDateString()}</p>
                        <button class="more-info-btn" onclick="showFoundItemDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            More Info
                        </button>
                    </div>
                    ${item.image ? `
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.subject}" loading="lazy">
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading items:', error);
            searchResults.innerHTML = '<p class="text-center error-message">Error loading items. Please try again.</p>';
        }
    };

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadItems(e.target.value.trim(), categoryFilter.value);
        }, 300);
    });

    // Category filter handler
    categoryFilter.addEventListener('change', () => {
        loadItems(searchInput.value.trim(), categoryFilter.value);
    });

    // Initial load
    loadItems();
});

// Profile dropdown functionality
const profileWrapper = document.getElementById('profile-wrapper');
const subMenu = document.getElementById('subMenu');

profileWrapper.addEventListener('click', () => {
    subMenu.classList.toggle('open-menu');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!profileWrapper.contains(e.target)) {
        subMenu.classList.remove('open-menu');
    }
});

// Logout functionality
document.getElementById('logout-link').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        if (response.ok) {
            window.location.href = '/';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
});

// Function to show found item details popup
function showFoundItemDetails(item) {
    // First get current user's registration number
    fetch('/api/check-auth')
        .then(response => response.json())
        .then(authData => {
            if (!authData.authenticated) {
                window.location.href = '/';
                return;
            }

            const currentUserRegNo = authData.user.registration_no;
            const isOwner = item.found_by_reg_no === currentUserRegNo;

            // Then get the item owner's details
            fetch(`/api/users/${item.found_by_reg_no}`)
                .then(response => response.json())
                .then(userData => {
                    const popupContent = `
                        <div class="popup-body">
                            <h3>${item.subject}</h3>
                            <button class="close-popup">&times;</button>
                            ${item.image ? `
                                <div class="popup-image" style="text-align: center;">
                                    <img src="${item.image}" alt="${item.subject}" style="max-width: 100%; margin: 10px 0;">
                                </div>
                            ` : ''}
                            <p><strong>Description:</strong> ${item.description}</p>
                            <p><strong>Found By:</strong> ${userData.name}</p>
                            <p><strong>Contact:</strong> ${userData.mobile_no}</p>
                            <div class="popup-actions">
                                ${isOwner ? `
                                    <button class="btn-primary close-ticket-button">Close Ticket</button>
                                ` : `
                                    <button class="btn-primary claim-button">Claim It</button>
                                `}
                            </div>
                        </div>
                    `;
                    
                    const popup = document.getElementById('item-details-popup');
                    popup.querySelector('.popup-content').innerHTML = popupContent;
                    popup.style.display = 'block';
                    
                    // Add event listeners
                    popup.querySelector('.close-popup').addEventListener('click', () => {
                        popup.style.display = 'none';
                    });
                    
                    if (isOwner) {
                        popup.querySelector('.close-ticket-button').addEventListener('click', async () => {
                            if (confirm('Are you sure you want to close this ticket? This action cannot be undone.')) {
                                try {
                                    const response = await fetch(`/api/found-items/${item.id}/close`, {
                                        method: 'POST'
                                    });
                                    
                                    const data = await response.json();
                                    if (response.ok) {
                                        alert('Ticket closed successfully!');
                                        popup.style.display = 'none';
                                        location.reload();
                                    } else {
                                        alert(data.error || 'Failed to close ticket');
                                    }
                                } catch (error) {
                                    console.error('Error closing ticket:', error);
                                    alert('Failed to close ticket. Please try again.');
                                }
                            }
                        });
                    } else {
                        popup.querySelector('.claim-button').addEventListener('click', async () => {
                            if (confirm('Are you sure you want to claim this item? This action cannot be undone.')) {
                                try {
                                    const response = await fetch(`/api/found-items/${item.id}/claim`, {
                                        method: 'POST'
                                    });
                                    
                                    const data = await response.json();
                                    if (response.ok) {
                                        alert('Item claimed successfully!');
                                        popup.style.display = 'none';
                                        location.reload();
                                    } else {
                                        alert(data.error || 'Failed to claim item');
                                    }
                                } catch (error) {
                                    console.error('Error claiming item:', error);
                                    alert('Failed to claim item. Please try again.');
                                }
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching user details:', error);
                    alert('Error loading item details. Please try again.');
                });
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        });
}

// Close popup when clicking outside
window.addEventListener('click', (e) => {
    const popup = document.getElementById('item-details-popup');
    if (e.target === popup) {
        popup.style.display = 'none';
    }
});

// Helper function to get category name
function getCategoryName(categoryId) {
    const categories = {
        1: 'Electronics',
        2: 'ID Cards',
        3: 'Wallets',
        4: 'Accessories',
        5: 'Notebooks'
    };
    return categories[categoryId] || 'Other';
}