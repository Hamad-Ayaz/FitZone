/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

workouts.js

This is the client side code for the workouts page.
*/
// Getting all the existing categories.
  function fetchCategories(type) {
    const endpoint = type === 'predefined' ? '/categories?predefined=true' : '/categories?custom=true';
    fetch(endpoint)
      .then((res) => res.json())
      .then((categories) => {
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';
        categories.forEach((category) => {
          const listItem = document.createElement('li');
          listItem.textContent = category.name;
          listItem.classList.add('category-item');

          const arrowSpan = document.createElement('span');
          arrowSpan.innerHTML = '&#x25BC;'; // Down arrow for collapsed state
          arrowSpan.style.marginLeft = '5px';
          listItem.appendChild(arrowSpan);
          
          if (type === 'custom') {
          const removeCategoryButton = document.createElement('button');
          removeCategoryButton.textContent = 'Remove';
          removeCategoryButton.classList.add('remove-category-button');
          removeCategoryButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent listItem click event
            removeCategory(category._id);
          });
          listItem.appendChild(removeCategoryButton);
        }
  
          const exercisesList = document.createElement('ul');
          exercisesList.style.display = 'none';
          exercisesList.classList.add('exercises-list');
  
          category.exercises.forEach((exercise) => {
            const exerciseItem = document.createElement('li');
            exerciseItem.textContent = exercise;
            
            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.classList.add('add-workout-button');
            addButton.addEventListener('click', () => {
              addWorkoutToSelectedList(exercise);
            });
            exerciseItem.appendChild(addButton);

            if (type === 'custom') {
            const removeExerciseButton = document.createElement('button');
            removeExerciseButton.textContent = 'Remove';
            removeExerciseButton.classList.add('remove-exercise-button');
            removeExerciseButton.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent listItem click event
              removeExercise(category._id, exercise, exerciseItem, exercisesList);
            });
            
            
            exerciseItem.appendChild(removeExerciseButton);
          }
  
            exercisesList.appendChild(exerciseItem);
          });
  
          listItem.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-workout-button') || event.target.classList.contains('remove-exercise-button') || event.target.classList.contains('remove-category-button')) {
              return;
            }
            if (exercisesList.children.length > 0) {
              if (exercisesList.style.display === 'none') {
                exercisesList.style.display = 'block';
                arrowSpan.innerHTML = '&#x25B2;'; // Up arrow for expanded state
              } else {
                exercisesList.style.display = 'none';
                arrowSpan.innerHTML = '&#x25BC;'; // Down arrow for collapsed state
              }
            }
          });
          
  
          listItem.appendChild(exercisesList);
          categoryList.appendChild(listItem);
        });
      });
  }
  // Removes the selected category.
  function removeCategory(categoryId) {
    fetch(`/categories/${categoryId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error removing category.');
        }
        return res.json();
      })
      .then((data) => {
        const activeTab = predefinedBtn.classList.contains('active') ? 'predefined' : 'custom';
        fetchCategories(activeTab);
      })
      .catch((err) => {
        console.error(err);
        alert('Error removing category. Please try again.');
      });
  }
  // Removes selected exercise. 
  function removeExercise(categoryId, exercise, exerciseItem, exercisesList) {
    fetch(`/categories/${categoryId}/exercises`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error removing exercise.');
        }
        return res.json();
      })
      .then((data) => {
        exerciseItem.remove(); // Remove the exercise item from the UI
  
        if (exercisesList.children.length === 0) {
          exercisesList.style.display = 'none'; // Hide the container if it has no remaining children
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error removing exercise. Please try again.');
      });
  }
  
  
  
// Adding selected workout to new list
function addWorkoutToSelectedList(workoutName) {
  const selectedWorkoutsList = document.getElementById('selected-workouts-list');
  const listItem = document.createElement('li');
  listItem.textContent = workoutName;

  const minusButton = document.createElement('button');
  minusButton.textContent = '-';
  minusButton.classList.add('remove-workout-button');
  minusButton.addEventListener('click', () => {
    selectedWorkoutsList.removeChild(listItem);
  });

  listItem.appendChild(minusButton);
  selectedWorkoutsList.appendChild(listItem);
}

// Adding event listeners for the buttons
const predefinedBtn = document.getElementById('predefined-btn');
const customBtn = document.getElementById('custom-btn');
predefinedBtn.classList.add('active');
predefinedBtn.addEventListener('click', () => {
  predefinedBtn.classList.add('active');
  customBtn.classList.remove('active');
  fetchCategories('predefined');
});
customBtn.addEventListener('click', () => {
  customBtn.classList.add('active');
  predefinedBtn.classList.remove('active');
  fetchCategories('custom');
});
fetchCategories('predefined');

const addCategoryForm = document.getElementById('add-category-form');
const categoryNameInput = document.getElementById('category-name');
addCategoryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const categoryName = categoryNameInput.value.trim();
  if (categoryName === "") {
    alert('Please enter a category name.');
    return;
  }
  const name = categoryNameInput.value;
  const isCustom = true;
  const categoryData = { name, isCustom };
  fetch('/upload-category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Error uploading category.');
      }
      return res.json();
    })
    .then((data) => {
      addCategoryForm.reset();
      customBtn.classList.add('active');
      predefinedBtn.classList.remove('active');
      fetchCategories('custom');
    })
    .catch((err) => {
      console.error(err);
      alert('Error uploading category. Please try again.');
    });
});

const addWorkoutsForm = document.querySelector('#add-workouts-form');

const addWorkoutsBtn = addWorkoutsForm.querySelector('button[type="submit"]');
addWorkoutsBtn.addEventListener('click', (event) => {
  event.preventDefault();
  window.location.href = 'upload_workout.html';
});
// Creating and uploading workout lists to the database
function submitList() {
  const listNameInput = document.getElementById('list-name');
  const listDateInput = document.getElementById('list-date');
  const selectedWorkoutsList = document.getElementById('selected-workouts-list');
  const workouts = [];

  for (const listItem of selectedWorkoutsList.children) {
    const workoutName = listItem.textContent.trim(); // Remove leading/trailing whitespace
    const strippedName = workoutName.replace(/-$/, ''); // Remove "-" at the end of the name
    workouts.push(strippedName);
  }

  const listData = {
    name: listNameInput.value,
    date: parseInt(listDateInput.value, 10), // Convert the selected day to an integer
    exercises: workouts,
  };

  // Send data to the server
  fetch('/upload-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listData),
  })
    .then((res) => res.json())
    .then((data) => {
      alert('List uploaded successfully to calendar.');
      listNameInput.value = '';
      listDateInput.value = '';
      selectedWorkoutsList.innerHTML = '';
    })
    .catch((err) => {
      console.error('Error uploading list:', err);
      alert(err.message || 'Error uploading list. Please try again.');
    });
}





const addListBtn = document.getElementById('add-list-btn');
addListBtn.addEventListener('click', () => {
  submitList();
});

document.addEventListener("DOMContentLoaded", function () {
  populateDateDropdown();
  addListFormValidation();

});
// Makes a drop down menu of numbers 1-31.
function populateDateDropdown() {
  const dateDropdown = document.getElementById("list-date");

  for (let i = 1; i <= 31; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    dateDropdown.add(option);
  }
}

function addListFormValidation() {
  const addListButton = document.getElementById("add-list-btn");
  
  addListButton.addEventListener("click", function (event) {
    const dateDropdown = document.getElementById("list-date");
    const listName = document.getElementById("list-name");

    // Check if "Select Date" is chosen or if the list name is empty
    if (dateDropdown.value === "" || listName.value.trim() === "") {
      event.preventDefault(); // Prevent form submission
      alert("Please select a date and enter a list name.");
    }
  });
}
// More event listeners
window.addEventListener('pageshow', () => {
  const predefinedBtnIsActive = predefinedBtn.classList.contains('active');
  const customBtnIsActive = customBtn.classList.contains('active');
  const urlParams = new URLSearchParams(window.location.search);
  const shouldShowCustomTab = urlParams.get('tab') === 'custom';

  if (shouldShowCustomTab) {
    customBtn.classList.add('active');
    predefinedBtn.classList.remove('active');
    fetchCategories('custom');
  } else if (predefinedBtnIsActive) {
    fetchCategories('predefined');
  } else if (customBtnIsActive) {
    fetchCategories('custom');
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
