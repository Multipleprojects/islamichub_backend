const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('dotenv').config();
const path = require("path");
// Use packages
const app = express();
// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));
// Routes
app.use('/user', require('./routes/userroutes'));
app.use('/admin', require('./routes/adminroutes'));
app.use('/uploadvideo', require('./routes/fileuploadroutes'));
app.use('/article', require('./routes/articleroutes'));

mongoose.set('strictQuery', false);
const url="mongodb+srv://bhattimudassir897:lQ7ElyC50THgmfJN@mudassirdeveloper.oixvv.mongodb.net/?retryWrites=true&w=majority&appName=mudassirdeveloper";
// Connect to the database
mongoose.connect(url)
  .then(async () => {
    console.log("Database connected successfully");
  })
  .catch((err) => console.log("Error occurred in database:", err));
  
  app.get('/', (req, res, next) => {
    console.log('Middleware function executed');
    next(); // Pass control to the next handler
  }, (req, res) => {
    res.send('Response from /example route');
  })
  // Define a route that handles GET requests to the root path
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
// Start the server
const PORT =8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
