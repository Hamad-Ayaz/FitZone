/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

profile.js

This is the client side code for the profile page.
*/


//Pulls the information about the current user.
let url = '/get/profile/';
let p = fetch(url);
let ps = p.then( (response) => {
  return response.json(); 
}).then((objects) => {
  let name = objects.username;
  let gender = objects.sex;
  let height = Number(objects.height);
  let weight = Number(objects.weight);
  let bmi = !isNaN(weight) && !isNaN(height) ? calculateBMI(weight, height) : NaN;
  document.getElementById('name').innerText = name;
  document.getElementById('gender').innerText = gender;
  document.getElementById('height').innerText = !isNaN(height) ? `${height} inches` : 'N/A'; // Added units
  document.getElementById('weight').innerText = !isNaN(weight) ? `${weight} lbs` : 'N/A'; // Added units
  document.getElementById('bmi').innerText = !isNaN(bmi) ? bmi.toFixed(1) : 'N/A';
}).catch(() => {
  alert('code get/profile: something went wrong');
});
// Searching for users
document.getElementById('search').addEventListener('click', async () => {
  const searchString = document.querySelector('input[placeholder="Search Users"]').value;
  const response = await fetch(`/api/search?q=${searchString}`);
  const users = await response.json();
  // After fetch is done we display.
  displayUsers(users);
});
// This is used to quickly get BMI
function calculateBMI(weight, height) {

  return (weight / (height ** 2))*703;
}



// Displays all users found in search.
function displayUsers(users) {
  const usersContainer = document.getElementById('users');
  usersContainer.innerHTML = '';

  users.forEach(user => {
    const weight = Number(user.weight);
    const height = Number(user.height);
    let bmi = 'N/A';
    if (!isNaN(weight) && !isNaN(height)) {
      bmi = calculateBMI(weight, height).toFixed(1);
    }
    const li = document.createElement('li');
    li.innerHTML = `
      <h3><strong>Name:</strong> ${user.username}</h3>
      <p><strong>Height:</strong> ${height} inches</p>
      <p><strong>Weight:</strong> ${weight} pounds</p>
      <p><strong>Gender:</strong> ${user.sex}</p>
      <p><strong>Fitness Level:</strong> ${user.fitnessLevel}</p>
      <p><strong>Gym Equipment:</strong> ${user.gymEquipment ? 'Yes' : 'No'}</p>
      <p><strong>Fitness Goals:</strong> ${user.fitnessGoals}</p>
      <p><strong>BMI:</strong> ${bmi}</p>
    `;
    usersContainer.appendChild(li);
  });
}

function checkSessionCookie() {
  const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
  if (!sessionCookie) {
    window.location.href = '/login.html';
  }
}
// Code for editing height (weight is below)
document.getElementById('edit-height').addEventListener('click', async () => {
  const newHeight = parseInt(prompt('Enter new height in inches:'));
  const username = document.getElementById('name').textContent;
  const currentWeight = Number(document.getElementById('weight').textContent.split(' ')[0]);

  if (isNaN(newHeight)) return;

  await fetch('/update-user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, height: newHeight }),
  });

  const newBmi = calculateBMI(currentWeight, newHeight);

  document.getElementById('height').textContent = `${newHeight} inches`;
  document.getElementById('bmi').textContent = !isNaN(newBmi) ? newBmi.toFixed(1) : 'N/A';
});

document.getElementById('edit-weight').addEventListener('click', async () => {
  const newWeight = parseInt(prompt('Enter new weight in pounds:'));
  const username = document.getElementById('name').textContent;
  const currentHeight = Number(document.getElementById('height').textContent.split(' ')[0]);

  if (isNaN(newWeight)) return;

  await fetch('/update-user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, weight: newWeight }),
  });

  const newBmi = calculateBMI(newWeight, currentHeight);

  document.getElementById('weight').textContent = `${newWeight} lbs`;
  document.getElementById('bmi').textContent = !isNaN(newBmi) ? newBmi.toFixed(1) : 'N/A';
});



// Check the session cookie every 20 seconds
setInterval(checkSessionCookie, 20 * 1000);
