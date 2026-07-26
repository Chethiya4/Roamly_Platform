const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { 
        type: String, 
        required: function() { return this.authProvider === 'local'; } 
    },
    googleId: { type: String, unique: true, sparse: true },
    appleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google', 'apple', 'facebook'], default: 'local' },
    role: { type: String, enum: ['visitor', 'business_owner', 'admin'], default: 'visitor' },
    active: { type: Boolean, default: true }
}, { timestamps: true, bufferCommands: true });

UserSchema.pre('save', async function() {
    if (!this.isModified('password') || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
