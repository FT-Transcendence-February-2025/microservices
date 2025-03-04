const loadPage = (page) => {
	window.location.href = page;
}

const logout = async () => {
	try {
		const response = await apiCall('http://127.0.0.1:3001/logout', {
			method: 'POST',
		});

		if (response.ok) {
		  localStorage.removeItem('token');
		  window.location.href = 'index.html';
			alert('You have successfully logged out');
		} else {
			alert('Logout failed');
			console.error('Logout failed:', await response.text());
		}
  } catch (error) {
		console.error('Error during logout:', error);
  }
};