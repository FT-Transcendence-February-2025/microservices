export const initializePasswordChange = () => {
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }
    console.log('Password change forms initialized');
};

export const handlePasswordChange = async (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;

    try {
        const response = await fetch('/api/password-change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        });

        if (!response.ok) {
            throw new Error('Password change failed');
        }

        alert('Password changed successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while changing the password');
    }
};