import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Registering with password:', password);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Hashed password:', hashedPassword);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        if (user) {
            console.log('User created with hashed password:', user.password);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Login attempt for email: ${email}`);

        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`Login failed: No user found with email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);

        console.log('Password match result:', isMatch);

        if (isMatch) {
            console.log(`Login successful for user: ${user._id}`);
            const token = generateToken(user._id);
            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token: token
            });
        } else {
            console.log(`Login failed: Incorrect password for user ${user._id}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error while fetching user profile' });
    }
};