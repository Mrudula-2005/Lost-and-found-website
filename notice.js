document.addEventListener('DOMContentLoaded', () => {
    const noticeForm = document.getElementById('lost-notice-form');

    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('subject', document.getElementById('subject').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('last_known_location', document.getElementById('location').value);
        formData.append('category_id', document.getElementById('category').value);
        
        const imageInput = document.getElementById('image');
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch('/api/issue-notice', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Notice issued successfully!');
                noticeForm.reset();
                window.location.href = 'home.html';
            } else {
                alert(data.error || 'Failed to issue notice');
            }
        } catch (error) {
            console.error('Error issuing notice:', error);
            alert('Failed to issue notice. Please try again.');
        }
    });
});