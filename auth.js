document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const registerBox = document.getElementById('register-box');
    const loginBox = document.querySelector('.auth-box:not(#register-box)');

    // Password visibility toggle functionality
    function setupPasswordToggle(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icon = toggle.querySelector('i');

        toggle.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Setup password toggles for all password fields
    setupPasswordToggle('password', 'login-password-toggle');
    setupPasswordToggle('reg_password', 'reg-password-toggle');
    setupPasswordToggle('confirm_password', 'confirm-password-toggle');

    // Check if user is already logged in
    fetch('/api/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                window.location.href = '/pages/home.html';
            }
        })
        .catch(error => console.error('Auth check failed:', error));

    // Toggle between login and register forms
    showRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const registration_no = document.getElementById('registration_no').value;
        const password = document.getElementById('password').value;

        try {
            console.log('Attempting login with:', { registration_no });
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ registration_no, password })
            });

            console.log('Server response status:', response.status);
            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to home page
                window.location.href = '/pages/home.html';
            } else {
                // Show specific error message from server if available
                const errorMessage = data.message || data.error || 'Login failed. Please check your credentials.';
                console.error('Login failed:', errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Login error details:', error);
            // Check if it's a network error
            if (!navigator.onLine) {
                alert('Network error. Please check your internet connection.');
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                alert('Unable to connect to the server. Please make sure the server is running.');
            } else {
                alert('An error occurred during login. Please try again later.');
            }
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        
        // Validate password confirmation
        if (formData.get('password') !== formData.get('confirm_password')) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData // Send the entire form data including the file
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please login.');
                // Switch back to login form
                registerBox.style.display = 'none';
                loginBox.style.display = 'block';
                // Clear registration form
                registerForm.reset();
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
}); 