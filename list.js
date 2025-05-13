document.addEventListener('DOMContentLoaded', () => {
    const foundItemForm = document.getElementById('found-item-form');
    const formInputs = foundItemForm.querySelectorAll('.form-input');

    // Add input event listeners for validation
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });

    foundItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form elements
        const subject = document.getElementById('subject');
        const description = document.getElementById('description');
        const location = document.getElementById('location');
        const category = document.getElementById('category');
        const image = document.getElementById('image');

        // Clear previous errors
        formInputs.forEach(input => {
            input.classList.remove('error');
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });

        // Validate form
        let hasError = false;

        if (!subject.value.trim()) {
            showError(subject, 'Please enter a subject');
            hasError = true;
        }

        if (!description.value.trim()) {
            showError(description, 'Please enter a description');
            hasError = true;
        }

        if (!location.value.trim()) {
            showError(location, 'Please enter the found location');
            hasError = true;
        }

        if (!category.value) {
            showError(category, 'Please select a category');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('subject', subject.value.trim());
        formData.append('description', description.value.trim());
        formData.append('found_location', location.value.trim());
        formData.append('category_id', category.value);
        
        if (image.files[0]) {
            const file = image.files[0];
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|png|gif)$/i)) {
                showError(image, 'Please upload only image files (JPEG, PNG, or GIF)');
                return;
            }
            formData.append('image', file);
        }

        // Disable form while submitting
        const submitButton = foundItemForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            console.log('Sending form data:', {
                subject: subject.value.trim(),
                description: description.value.trim(),
                found_location: location.value.trim(),
                category_id: category.value,
                has_image: !!image.files[0]
            });

            const response = await fetch('/api/report-found', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                alert('Item reported successfully!');
                foundItemForm.reset();
                window.location.href = 'home.html';
            } else {
                const errorMessage = data.error || 'Failed to report item';
                console.error('Error details:', data);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error reporting item:', error);
            alert('Failed to report item. Please try again.');
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Found Item';
        }
    });

    // Helper function to show error messages
    function showError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
        input.focus();
    }
});
