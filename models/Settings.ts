import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;
