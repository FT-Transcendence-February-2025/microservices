document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const inviteButton = document.getElementById('inviteButton');
    console.log('Invite button:', inviteButton);
  
    inviteButton.addEventListener('click', async () => {
      console.log('Invite button clicked');
      try {
        const tournamentId = 1;
        console.log('Tournament ID:', tournamentId);
        const url = `http://localhost:3000/tournaments/${tournamentId}/invite`;
        console.log('Request URL:', url);
        const postResponse = await fetch(url, {
          method: 'POST',
        });
        const postResult = await postResponse.json();
        console.log('Host Tournament (POST) Response:', postResult);
      } catch (error) {
        console.error('Error handling Host Tournament actions:', error);
      }
    });
  });

//doesnt work: it passes "${tournamentId}" as tournamentId when clicking button in firefox browser
  