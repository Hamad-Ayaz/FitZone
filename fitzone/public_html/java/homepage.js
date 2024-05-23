/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

homepage.js

This is the client side code for the homepage.
*/

// This gets and waits for fetching both the meals and workouts, they are then displayed on the calendar on the homepage.
async function fetchData() {
  try {
    const userIdResponse = await fetch('http://192.241.145.13:3000/api/user-id');
    const userIdData = await userIdResponse.json();
    const userId = userIdData.userId;

    const workoutsResponse = await fetch(`http://192.241.145.13:3000/api/workouts/${userId}`);
    const mealsResponse = await fetch(`http://192.241.145.13:3000/api/meals/${userId}`);

    const workouts = await workoutsResponse.json();
    const meals = await mealsResponse.json();

    populateTable(workouts, meals);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}
// This loops through and displays the information on the table.
function populateTable(workouts, meals) {
  for (let i = 1; i <= 31; i++) {
    const cell = document.getElementById(i.toString());
    if (cell) {
      const cellWorkouts = workouts
        .filter(workout => workout.date === i)
        .map(workout => workout.name)
        .join(', ');

      const cellMeals = meals.filter(meal => meal.date === i);
      const cellMealsCount = cellMeals.length;

      if (cellWorkouts) {
        cell.innerHTML += `<div class="workout-list">${cellWorkouts}</div>`;
      } else {
        cell.innerHTML += `<div class="workout-list">No Workouts</div>`;
      }

      if (cellMealsCount > 0) {
        cell.innerHTML += `<div class="meal-count">Meals: ${cellMealsCount}</div>`;
      }
      else{
        cell.innerHTML += `<div class="meal-count">No Meals</div>`;
      }
    }
  }
}

fetchData();
// To delete the information
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", async () => {
  // Show confirmation dialog box
  const confirmed = confirm("WARNING: This will delete all calendar data!");
  
  // If the user clicks "OK" in the confirmation box, proceed with reset
  if (confirmed) {
    try {
      const resetDataResponse = await fetch('/api/reset-data', {
        method: 'DELETE'
      });
      
      if (resetDataResponse.ok) {
        location.reload();
      } else {
        alert("Reset failed.");
      }
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
});

window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

function checkSessionCookie() {
  const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
  if (!sessionCookie) {
    window.location.href = '/login.html';
  }
}

// Check the session cookie every 20 seconds
setInterval(checkSessionCookie, 20 * 1000);
