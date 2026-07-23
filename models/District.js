const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true
  },

  tagline: {
    type: String,
    required: true
  },

  province: {
    type: String,
    required: true
  },

  bestTime: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  heroImage: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  descriptionTwo: {
    type: String,
    required: true
  },

  attractions: {
    type: Array,
    default: []
  },

  activities: {
    type: Array,
    default: []
  },

  gallery: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model(
  'District',
  districtSchema
);