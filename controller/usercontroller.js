const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const UserModel = require('../models/usermodel');

// Create a new user
const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already taken' });
    }
    // Check if password already exists
    const existingPassword = await UserModel.findOne({ password });
    if (existingPassword) {
      return res.status(409).json({ message: 'Password already taken' });
    }
    // Create a new user
    const newUser = new UserModel({ email, name, password });
// Save user to the database
await newUser.save();

    // Increment the Visitors field for all users
    await UserModel.updateMany({}, { $inc: { Visitors: 1 } });
    
    // Send response
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};
// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if the email already exists for another user
    const existingUser = await UserModel.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use by another user' });
    }

    // Update user by ID
    const user = await UserModel.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true } // Ensure validators are run and updated document is returned
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({ message: 'New password  are required' });
    }


    // Update password by ID
    const user = await UserModel.findByIdAndUpdate(
      id,
      { password },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
// };
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     // Check if the user or admin exists
//     const existAdmin = await Admin.findOne({ email });
//     const user = await UserModel.findOne({ email });

//     if (!existAdmin && !user) {
//       return res.status(404).json({ message: 'Email not found' });
//     }

//     // Check admin password
//     if (existAdmin && existAdmin.password === password) {
//       // Generate token for admin
//       const adminToken = jwt.sign({ _id: existAdmin._id}, 'whynot123', { expiresIn: '1d' });
//       return res.status(200).json({ message: 'Admin login successful', token: adminToken });
//     }

//     // Check user password
//     if (user && user.password === password) {
//       // Generate token for user
//       const userToken = jwt.sign({ _id: user._id, role: 'user' }, 'whynot123', { expiresIn: '1d' });
//       return res.status(200).json({ message: 'User login successful', token: userToken });
//     }
//     // If the password does not match
//     return res.status(400).json({ message: 'Password incorrect', id:user._id });
//   } catch (error) {
//     console.error('Error logging in:', error);
//     return res.status(500).json({ message: 'Error logging in', error: error.message });
//   }
// };
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user or admin exists
    const existAdmin = await Admin.findOne({ email });
    const user = await UserModel.findOne({ email });

    let role;
    let userId;
    let token;

    if (existAdmin && existAdmin.password === password) {
      // Admin login
      role = 'admin';
      userId = existAdmin._id;
    } else if (user && user.password === password) {
      // User login
      role = 'user';
      userId = user._id;
    } else {
      // If no user or password does not match
      return res.status(400).json({ message: 'Password incorrect', id: user ? user._id : null });
    }

    // Generate token with role information
    token = jwt.sign({ _id: userId, role: role }, 'whynot123', { expiresIn: '1d' });

    // Send success response with role-based message
    res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`, token: token, });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  loginUser,
updateUser,
deleteUser,
updateUserPassword
};
