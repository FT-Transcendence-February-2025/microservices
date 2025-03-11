async function apiCall(url, options = {}) {
	let token = localStorage.getItem('token');

	// Ensure we have headers and attach the token
	const headers = options.headers ? { ...options.headers } : {};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}
	options.headers = headers;
	options.credentials = 'include';

	// Make the initial request
	let response = await fetch(url, options);

	// If unauthorized, try refreshing the token
	if (response.status === 401) {
		alert('trying to refresh the token');
		const refreshResponse = await fetch('http://127.0.0.1:3001/refresh', {
			method: 'POST',
			credentials: 'include'
		});

		if (refreshResponse.ok) {
			alert('received new token');
			const refreshData = await refreshResponse.json();
			token = refreshData.token;
			localStorage.setItem('token', token);  // Store the new token

			// Update the authorization header with the new token
			options.headers['Authorization'] = `Bearer ${token}`;

			// Retry the original request
			response = await fetch(url, options);
		} else {
			// If refresh fails, you might redirect to login or show an error.
			alert('failed to receive new token');
			window.location.href = 'login.html';
			return; // Stop execution.
		}
	}

	return response;
}
