const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    files: {
        type: Object,
        required: true
    },
    framework: {
        type: String,
        required: true,
        enum: ['tailwind', 'react', 'both']
    },
    prompt: {
        type: String,
        trim: true
    },
    activeFile: {
        type: String,
        trim: true
    },
    hasGenerated: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
sessionSchema.index({ userId: 1, name: 1 }, { unique: true });
sessionSchema.index({ createdAt: -1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 