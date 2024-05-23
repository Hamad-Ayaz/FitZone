/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

getting_started.js

This is the client side code for the create account page. It just checks cookies.
*/

// Checks cookies
function checkSessionCookie() {
  const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
  if (!sessionCookie) {
    window.location.href = '/login.html';
  }
}

// Check the session cookie every 20 seconds
setInterval(checkSessionCookie, 20 * 1000);
