/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

login.js

This is the client side code for the login page.
*/

// Add an event listener to the submit button of addUserForm.
document.getElementById('createAccountForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the value of the username and password input field.
    const password = document.getElementById('new-password').value;
    const username = document.getElementById('new-username').value;
    try {
        // Sends a POST request to /add/user/ with the password and username in the request body as JSON
        const response = await fetch('/add/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        // If the response is successful.
        if (response.ok) {
            // Redirect the user to the getting_started.html page
            window.location.href = '/getting_started.html';
        }
        //if username already exists.
        else if (response.status === 400) {
            alert("This username is taken")
        }
        // If the response is not successful.
        else {
            alert("Error adding user.");
        }
    } catch (error) {
        // If an error occurs during the request, log the error to the console and show an alert message
        console.error(error);
        alert("Error adding user.");
    }
});

// Add an event listener to the submit button of addUserForm.
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the value of the username and password input field.
    const logpassword = document.getElementById('password').value;
    const logusername = document.getElementById('username').value;

    try {
        // Sends a POST request to /login with the password and username in the request body as JSON
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logusername, logpassword }),
        });

        if (response.ok) {
            window.location.href = '/homepage.html';
        } else if (response.status === 404) {
            alert('User not found.');
        } else if (response.status === 401) {
            alert('Invalid password.');
        } else {
            alert('Error logging in.');
        }

    } catch (error) {
        // If an error occurs during the request, log the error to the console and show an alert message
        console.error(error);
    }
});