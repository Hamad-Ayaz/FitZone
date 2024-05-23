/*
Hamad Hamad Ayaz
Donald Ray Abram
Stephen James Ceja

337 Final Project

server.js

This is the server side code file.
*/


// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); 
const session = require("express-session");

 

// Initialize Express app and middleware
const app = express();
app.set('json spaces', 2);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public_html"));
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2 * 60 * 60 * 1000 }, // 2 hours
}));


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fitzone', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  height: Number,
  weight: Number,
  sex: String,
  fitnessLevel: String,
  gymEquipment: Boolean,
  fitnessGoals: String
});

const categorySchema = new mongoose.Schema({
  name: String,
  exercises: [String],
  isCustom: Boolean,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const workoutListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Number }, // Change this line
  exercises: [{ type: String }],
  name: String,
});

var MealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Number }, 
  meal: String,
  description: String,
  calories: String,
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    return false;
  }
};

const User = mongoose.model("User", userSchema);
const Category = mongoose.model('Category', categorySchema);
const WorkoutList = mongoose.model('WorkoutList', workoutListSchema);
const Meals = mongoose.model('Meals', MealSchema);

//require cookies endpoint access check
function requireCookie(req, res, next) {
  console.log(req.cookies)
  const username = req.cookies.username;
  if (username) {
      // User has a valid cookie, so we can proceed to the next middleware.
      next();
  } else {
      // User does not have a valid cookie, so we redirect them to the login page.
      res.redirect('/login.html');
  }
}

app.get('/test', requireCookie, (req, res) => {
 
  res.send('You have a valid cookie.');
});

// Route Handlers
app.post('/add/user', async (req, res) => {
    try {
        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
          res.status(400).send('Username already exists.');
          return;
        }
        const newUser = new User({
          username: req.body.username,
          password: req.body.password,
          height: req.body.height,
          weight: req.body.weight,
          sex: req.body.sex,
          fitnessLevel: req.body['fitness-level'],
          gymEquipment: req.body['gym-equipment'] === 'yes',
          fitnessGoals: req.body['fitness-goals'],
        });

        // Set a cookie named 'username' with the value of the new user's username
        res.cookie('username', req.body.username, { maxAge: 3600000 , httpOnly: false });

        // Save the new user document to the database
        await newUser.save();
        res.send('User added successfully.');
      } catch (err) {
        res.status(500).send(err.message);
      }
});

app.post('/login', async (req, res) => {
    try {
        // Retrieve the user document based on the username provided in the login form
        const user = await User.findOne({ username: req.body.logusername });
        if (!user) {
          res.status(404).send('User not found.');
          return;
        }
        // Use the comparePassword method to check whether the plaintext password matches the stored hash
        const match = await user.comparePassword(req.body.logpassword);
        if (match) {
          // If the password matches, set a cookie for the user and redirect to the home page
          res.cookie('username', user.username, { maxAge: 3600000 , httpOnly: false });
          res.redirect('/homepage.html');
          return;
        }
        // If the password does not match, return an error message
        res.status(401).send('Invalid password.');
      } catch (err) {
        res.status(500).send(err.message);
      }
});
// Root for uploading new category
app.post('/upload-category', requireCookie, async (req, res) => {
    try {
      const { name, isCustom, exercises } = req.body;
      const user = await User.findOne({ username: req.cookies.username });
  
      const categoryData = {
        name,
        exercises,
        isCustom,
        userId: isCustom ? user._id : undefined,
      };
  
      const newCategory = new Category(categoryData);
      await newCategory.save();
  
      res.status(201).json({ message: 'Category uploaded successfully.' });
    } catch (err) {
      console.error('Error uploading category:', err.stack);
      res.status(500).json({ message: `Error uploading category. Please try again. Error: ${err.message}` });
    }     
});
// Root for updating a new profile
app.post('/update-profile', requireCookie, async (req, res) => {
    try {
        const filter = { username: req.cookies.username };
        const update = {
          height: req.body.height,
          weight: req.body.weight,
          sex: req.body.sex,
          fitnessLevel: req.body['fitness-level'],
          gymEquipment: req.body['gym-equipment'] === 'yes',
          fitnessGoals: req.body['fitness-goals']
        };
        const result = await User.updateOne(filter, update);
        res.redirect('/homepage.html');
      } catch (err) {
        res.status(500).send(err.message);
      }
});
// Route for adding a new workout to the database.
app.post('/add-workout', requireCookie, async (req, res) => {
  try {
    const { categoryId, name } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    category.exercises.push(name);
    await category.save();

    res.status(201).json({ message: 'Workout added to category successfully.' });
  } catch (err) {
    console.error('Error adding workout to category:', err.stack);
    res.status(500).json({ message: `Error adding workout to category. Please try again. Error: ${err.message}` });
  }
});
// Route for uploading a workout list.
app.post('/upload-list', requireCookie, async (req, res) => {
  try {
    const { date, exercises, name } = req.body;
    const user = await User.findOne({ username: req.cookies.username });

    const workoutList = new WorkoutList({
      userId: user._id,
      date: date, // Remove the "new Date()" conversion
      exercises: exercises,
      name: name,
    });

    await workoutList.save();
    res.status(200).json({ message: "Workout list saved successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred while saving the workout list." });
  }
});


app.post('/add/meal', requireCookie, async (req, res) => {
  try {
   // attempts to add new meal
   const user = await User.findOne({ username: req.cookies.username });
    const newMeal = new Meals({
      userId: user._id,
      date: req.body.date,
      meal: req.body.meal,
      description: req.body.description,
      calories: req.body.calories
    });
    // Saves new meal doc to databse
    await newMeal.save();
    res.send('mealSaved');
  } catch (err) {
    res.status(500).send(err.message);
  }
  });
// Route for getting the user id
  app.get('/api/user-id', requireCookie, async (req, res) => {
    try {
      const user = await User.findOne({ username: req.cookies.username });
      if (!user) {
        res.status(404).send('User not found.');
        return;
      }
      res.json({ userId: user._id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
// Route for getting the workout lists.
  app.get('/api/workouts/:userId', requireCookie, async (req, res) => {
    const workouts = await WorkoutList.find({ userId: req.params.userId });
    res.json(workouts);
  });
  // Route for getting the meals.
  app.get('/api/meals/:userId', async (req, res) => {
    const meals = await Meals.find({ userId: req.params.userId });
    res.json(meals);
  });

  // Search for users by username
app.get("/api/search", requireCookie, async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const users = await User.find({ username: new RegExp(searchQuery, 'i') });
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Route for getting categories.
app.get('/categories', requireCookie, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.cookies.username });
        if (!user) {
          res.status(404).send('User not found.');
          return;
        }
        const predefined = req.query.predefined === 'true';
        const custom = req.query.custom === 'true';
    
        if (predefined && !custom) {
          const categories = await Category.find({ isCustom: false });
          res.send(categories);
        } else if (custom && !predefined) {
          const categories = await Category.find({ isCustom: true, userId: user._id });
          res.send(categories);
        } else {
          res.status(400).send('Bad request: either predefined or custom query parameter must be true');
        }
      } catch (err) {
        res.status(500).send(err.message);
      }
});

// Route for getting profile information
app.get('/get/profile', requireCookie, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.cookies.username });
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }
    User.findOne({username: user.username})
      .then((results) => 
      {
          res.end(JSON.stringify(results));
      })
      .catch((error) => 
      {
          console.log(error);
          res.end('error');
      });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Deleting data.
app.delete('/api/reset-data', requireCookie, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.cookies.username });
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }
    await WorkoutList.deleteMany({ userId: user._id });
    await Meals.deleteMany({ userId: user._id });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Deleting specific data.
app.delete('/api/reset-data/:day', requireCookie, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.cookies.username });
    if (!user) {
      res.status(404).send('User not found.');
      return;
    }
    await WorkoutList.deleteMany({ userId: user._id, date: req.params.day });
    await Meals.deleteMany({ userId: user._id, date: req.params.day });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deleting category
app.delete('/delete', requireCookie, async (req, res) => {
  const { categoryId, exerciseName } = req.body;

  try {
    if (exerciseName) {
      await Category.findByIdAndUpdate(categoryId, {
        $pull: { exercises: exerciseName },
      });
    } else {
      await Category.findByIdAndRemove(categoryId);
    }

    res.status(200).send('Removed successfully');
  } catch (error) {
    console.error('Error deleting category or exercise:', error);
    res.status(500).send('Error deleting category or exercise');
  }
});

// DELETE endpoint for removing a category
app.delete('/categories/:categoryId', requireCookie, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: 'Category removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing category. Please try again.' });
  }
});

// DELETE endpoint for removing an exercise
app.delete('/categories/:categoryId/exercises', requireCookie, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { exercise } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    category.exercises = category.exercises.filter((e) => e !== exercise);
    await category.save();

    res.status(200).json({ message: 'Exercise removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing exercise. Please try again.' });
  }
});
// Updating height and weight
app.put('/update-user', requireCookie, async (req, res) => {
  try {
    const { username, height, weight } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    if (height !== undefined) {
      user.height = height;
    }

    if (weight !== undefined) {
      user.weight = weight;
    }

    await user.save();
    res.send('User updated successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
