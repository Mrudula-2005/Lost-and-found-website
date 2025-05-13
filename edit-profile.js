document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and get user data
    fetch('/api/check-auth')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/';
                return;
            }
            initializeProfile(data.user);
            setupEventListeners(data.user);
            setupPasswordToggles();
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        });
});

function initializeProfile(userData) {
    // Set profile image
    const profilePreview = document.getElementById('profile-preview');
    if (profilePreview) {
        profilePreview.src = userData.profile_picture || '../images/default-profile.png';
    }

    // Set user details
    document.getElementById('registration-no').value = userData.registration_no;
    document.getElementById('name-input').value = userData.name;
    document.getElementById('email-input').value = userData.email;
    document.getElementById('mobile-input').value = userData.mobile_no || '';
}

function setupPasswordToggles() {
    // Setup password toggles
    ['new-password', 'confirm-password'].forEach(id => {
        const input = document.getElementById(id);
        const toggle = document.getElementById(`${id}-toggle`);
        if (input && toggle) {
            toggle.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggle.querySelector('i').classList.toggle('fa-eye');
                toggle.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    });
}

function setupEventListeners(userData) {
    // Handle edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fieldId = e.currentTarget.dataset.field;
            const input = document.getElementById(fieldId);
            input.readOnly = !input.readOnly;
            input.classList.toggle('editing');
            e.currentTarget.querySelector('i').classList.toggle('fa-edit');
            e.currentTarget.querySelector('i').classList.toggle('fa-check');
        });
    });

    // Handle profile image change
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        profileImage.addEventListener('change', handleImageChange);
    }

    // Handle password change button
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordSection = document.getElementById('password-change-section');
    changePasswordBtn.addEventListener('click', () => {
        passwordSection.classList.toggle('hidden');
    });

    // Handle form submission
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', (e) => handleSubmit(e, userData));
    }

    // Handle cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            initializeProfile(userData);
            document.querySelectorAll('input[readonly]').forEach(input => {
                input.classList.remove('editing');
            });
            document.querySelectorAll('.edit-btn i').forEach(icon => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-edit');
            });
            document.getElementById('password-change-section').classList.add('hidden');
        });
    }
}

function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('profile-preview');
        if (preview) {
            preview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

async function handleSubmit(e, userData) {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;

    // Check for field changes
    const fields = ['registration_no', 'name', 'email', 'mobile_no'];
    fields.forEach(field => {
        const input = document.getElementById(field === 'registration_no' ? 'registration-no' : `${field.split('_')[0]}-input`);
        if (input && !input.readOnly && input.value !== userData[field]) {
            formData.append(field, input.value);
            hasChanges = true;
        }
    });

    // Check for profile image changes
    const profileImage = document.getElementById('profile-image');
    if (profileImage && profileImage.files[0]) {
        formData.append('profile_picture', profileImage.files[0]);
        hasChanges = true;
    }

    // Check for password changes
    const passwordSection = document.getElementById('password-change-section');
    if (!passwordSection.classList.contains('hidden')) {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            formData.append('new_password', newPassword);
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        alert('No changes made');
        return;
    }

    try {
        const response = await fetch('/api/update-profile', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update profile');
        }

        const data = await response.json();
        alert('Profile updated successfully!');
        window.location.reload();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert(error.message);
    }
} 