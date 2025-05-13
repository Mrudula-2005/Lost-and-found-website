// Popup functionality
function showContactPopup(itemData) {
    const popup = document.getElementById('contact-popup');
    const popupContent = `
        <div class="popup-header">
            <h3>${itemData.subject || 'Item Details'}</h3>
            <button class="close-popup">&times;</button>
        </div>
        <div class="popup-body">
            <div class="contact-info">
                <p><strong>Description:</strong> ${itemData.description || 'Not available'}</p>
                <p><strong>Found By:</strong> ${itemData.username || 'Not available'}</p>
                <p><strong>Contact:</strong> ${itemData.contact || 'Not available'}</p>
                <p><strong>Location:</strong> ${itemData.location || 'Not available'}</p>
                ${itemData.category ? `<p><strong>Category:</strong> ${itemData.category}</p>` : ''}
                ${itemData.image ? `
                    <div class="popup-image">
                        <img src="${itemData.image}" alt="${itemData.subject || 'Item Image'}" style="max-width: 100%; margin-top: 10px;">
                    </div>
                ` : ''}
                <div class="popup-actions" style="margin-top: 20px; text-align: right;">
                    <button class="btn-primary claim-button">Claim It</button>
                </div>
            </div>
        </div>
    `;

    popup.querySelector('.popup-content').innerHTML = popupContent;
    popup.classList.add('active');

    // Add claim button event listener
    const claimButton = popup.querySelector('.claim-button');
    if (claimButton) {
        claimButton.addEventListener('click', () => {
            // Claim functionality will be added later
            alert('Claim functionality coming soon!');
        });
    }
}

function closeContactPopup() {
    const popup = document.getElementById('contact-popup');
    popup.classList.remove('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Close popup when clicking outside
    const popup = document.getElementById('contact-popup');
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeContactPopup();
            }
        });

        // Close popup when clicking the close button
        const closeButton = popup.querySelector('.close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', closeContactPopup);
        }
    }
});

// Function to create item cards with contact buttons
function createItemCard(item, type = 'found') {
    const card = document.createElement('div');
    card.className = 'item-card';

    const content = `
        <h4>${item.description}</h4>
        <p><strong>Location:</strong> ${item.location}</p>
        ${type === 'found' ? `<p><strong>Category:</strong> ${item.category}</p>` : ''}
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Date:</strong> ${new Date(item.created_at).toLocaleDateString()}</p>
        <div class="card-actions">
            <button class="card-button ${type === 'found' ? 'claim-button' : 'found-button'}">
                ${type === 'found' ? 'Claim it' : 'Found it'}
            </button>
        </div>
    `;

    card.innerHTML = content;

    // Add click event for the button
    const button = card.querySelector('.card-button');
    button.addEventListener('click', () => {
        // Fetch user details before showing popup
        fetch(`/api/user/${item.user_id}`)
            .then(response => response.json())
            .then(userData => {
                showContactPopup({
                    username: userData.username,
                    contact: userData.contact || item.contact_info,
                    description: item.description,
                    location: item.location
                });
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                showContactPopup({
                    username: 'Error loading user',
                    contact: 'Error loading contact',
                    description: item.description,
                    location: item.location
                });
            });
    });

    return card;
} 