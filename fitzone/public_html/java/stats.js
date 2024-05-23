/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

stats.js

This is the client side code for the day stats page.
*/

// Function to get and display the workouts and meals for that particular day.
  async function fetchData() {
    try {
      const params = new URLSearchParams(window.location.search);
      const day = params.get('day');
      const userIdResponse = await fetch('/api/user-id');
      const { userId } = await userIdResponse.json();

      const workoutsResponse = await fetch(`/api/workouts/${userId}`);
      const workouts = await workoutsResponse.json();
      const workoutForDay = workouts.filter(workout => workout.date === parseInt(day));

      const mealsResponse = await fetch(`/api/meals/${userId}`);
      const meals = await mealsResponse.json();
      const mealsForDay = meals.filter(meal => meal.date === parseInt(day));

      const workoutListContainer = document.getElementById('workout-list');
      if (workoutForDay.length > 0) {
        workoutForDay.forEach(workout => {
          const workoutListTitle = document.createElement('h3');
          workoutListTitle.textContent = workout.name;
          workoutListContainer.appendChild(workoutListTitle);

          const workoutListElement = document.createElement('ul');
          workout.exercises.forEach(exercise => {
            const listItem = document.createElement('li');
            listItem.textContent = exercise;
            workoutListElement.appendChild(listItem);
          });

          workoutListContainer.appendChild(workoutListElement);
        });
      } else {
        const noWorkoutsText = document.createElement('p');
        noWorkoutsText.textContent = 'No workouts for this day';
        workoutListContainer.appendChild(noWorkoutsText);
      }

      const mealListElement = document.getElementById('meal-list');
      if (mealsForDay.length > 0) {
        let totalCalories = 0;
        mealsForDay.forEach(meal => {
          const listItem = document.createElement('li');
          listItem.textContent = `${meal.meal} - ${meal.description} (${meal.calories} calories)`;
          mealListElement.appendChild(listItem);
          totalCalories += parseInt(meal.calories);
        });
        const totalCaloriesText = document.createElement('p');
        totalCaloriesText.textContent = `Total Calories: ${totalCalories}`;
        totalCaloriesText.setAttribute("id", "total-calories");
        mealListElement.appendChild(totalCaloriesText);
      } else {
        const noMealsText = document.createElement('p');
        noMealsText.textContent = 'No meals for this day';
        mealListElement.appendChild(noMealsText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchData();
// Code for resetting that particular day.
  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", async () => {
    const confirmReset = confirm("WARNING:This will delete all data for this date!");
    if (!confirmReset) {
      return;
    }
  
    try {
      const params = new URLSearchParams(window.location.search);
      const day = params.get('day');
      const resetDataResponse = await fetch(`/api/reset-data/${day}`, {
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
  });

  function checkSessionCookie() {
    const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
    if (!sessionCookie) {
      window.location.href = '/login.html';
    }
  }
  
  // Check the session cookie every 20 seconds
  setInterval(checkSessionCookie, 20 * 1000);
  