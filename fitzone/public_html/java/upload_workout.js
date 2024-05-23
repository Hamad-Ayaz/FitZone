/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

upload_workout.js

This is the client side code for adding a workout page.
*/
// Getting the workouts that already exist.
async function fetchCategories() {
  try {
    const response = await fetch('/categories?custom=true'); // Add the required query parameter
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const categories = await response.json();
    populateCategorySelect(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}
// Displaying selected category
function setSelectedCategory() {
  const selectedCategoryId = sessionStorage.getItem("selectedCategoryId");
  if (selectedCategoryId) {
    const categorySelect = document.getElementById("category-select");
    categorySelect.value = selectedCategoryId;
  }
}
// Displaying the found categories.
function populateCategorySelect(categories) {
  const categorySelect = document.getElementById("category-select");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category._id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

  // Global variables used throughout
  const addWorkoutForm = document.getElementById('add-workout-form');
  const workoutNameInput = document.getElementById('workout-name');
  
  addWorkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
  
    const categoryId = document.getElementById('category-select').value;
    sessionStorage.setItem("selectedCategoryId", categoryId);
    const workoutName = workoutNameInput.value;
  
    const workoutData = {
      categoryId,
      name: workoutName,
    };
  // For adding a new workout
    fetch('/add-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        const data = await res.json();
        alert('Workout added successfully.');
        workoutNameInput.value = ''; // Reset only the workoutNameInput
        setSelectedCategory(); // Set the selected category after submitting the form
      })
      .catch((err) => {
        console.error('Error adding workout:', err);
        alert(err.message || 'Error adding workout. Please try again.');
      })
      .finally(() => {
        console.log('Fetch request completed');
      });
  });
  
  
  fetchCategories();

  function checkSessionCookie() {
    const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
    if (!sessionCookie) {
      window.location.href = '/login.html';
    }
  }
  
  // Check the session cookie every 20 seconds
  setInterval(checkSessionCookie, 20 * 1000);
  
  