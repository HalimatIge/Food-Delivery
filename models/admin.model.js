const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    
    name: {
      type: String,
      required: [true, 'Property name is required'],
      unique: [true, 'Property already exists'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Residential Properties', 'Commercial Properties', 'Industrial Properties','Agricultural Properties','Special-Purpose Properties','Land'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Available', 'Rented', 'Sold'], // Adjust based on possible statuses
    },
    owner: {
      type: String,
      required: [true, 'Owner is required'],
    },
    image: [
      {
        public_id: {
          type: String,
          // required: true,
        },
        name: {
          type: String,
          // required: true,
        },
        url: {
          type: String,
          // required: [true, 'file url (file_upload.url)'],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
  }
);

// Middleware to auto-increment the 'id' field


const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
