const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  logo: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  website: { type: String, default: '' },
  about: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
