/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

nutrition.js

This is the client side code for the nutrition page.
*/

document.addEventListener("DOMContentLoaded", function () {
    populateDateDropdown();
  
  });

// Makes a dropdown menu of numbers 1-31
  function populateDateDropdown() {
    const dateDropdown = document.getElementById("list-date");
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = i;
      dateDropdown.add(option);
    }
  }
// Adding a meal to the database
document.getElementById('createMeal').addEventListener('submit', async (event) => {
    event.preventDefault();
    const meal = document.getElementById('meal').value;
        const description = document.getElementById('description').value;
        const calories = document.getElementById('calories').value;
        const dateDropdown = document.getElementById("list-date");
        
    if (dateDropdown.value === "") {
        event.preventDefault(); // Prevent form submission
        alert("Please select a date and enter a list name.");
      } else{
        var date = parseInt(dateDropdown.value);
        let url = '/add/meal/';
        try {
            // post request to /add/meal
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({meal, description, calories, date}),
                headers: {"Content-Type": "application/json"}
            });
            if (response.ok) {
              window.alert("Meal successfully added!");
              document.getElementById('meal').value = "";
              document.getElementById('description').value = "";
              document.getElementById('calories').value = "";
              document.getElementById("list-date").selectedIndex = 0;

            }
        } catch (error) {
            // Should it fail, will log error
            console.error(error);
            alert("Error adding meal.");
        }

      }
    // Get the value of the username and password input field.

});

function checkSessionCookie() {
  const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
  if (!sessionCookie) {
    window.location.href = '/login.html';
  }
}

// Check the session cookie every 20 seconds
setInterval(checkSessionCookie, 20 * 1000);
