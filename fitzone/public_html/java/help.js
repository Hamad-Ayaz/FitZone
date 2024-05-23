/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

help.js

This is the client side code for the help page. It just checks for cookies.
*/

function checkSessionCookie() {
  const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
  if (!sessionCookie) {
    window.location.href = '/login.html';
  }
}

// Check the session cookie every 20 seconds
setInterval(checkSessionCookie, 20 * 1000);
