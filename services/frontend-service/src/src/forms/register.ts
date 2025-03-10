export const initializeRegistration = () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    console.log('Registration forms initialized');
};

export const handleRegister = async (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('input[name="email"]') as HTMLInputElement).value;
    const displayName = (form.querySelector('input[name="displayName"]') as HTMLInputElement).value;
    const password = (form.querySelector('input[name="password"]') as HTMLInputElement).value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, displayName, password }),
    });

    if (response.ok) {
        const data = await response.json();
        alert(`Registration successful: ${data.message}`);
        // Optionally redirect to login or another page
    } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message}`);
    }
};