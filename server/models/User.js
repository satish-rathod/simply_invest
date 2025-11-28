import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: { type: String, required: true },
    virtualBalance: { type: Number, default: 50000 },
    bio: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
    username: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Remove the pre-save hook

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;