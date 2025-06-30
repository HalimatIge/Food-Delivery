const Property = require("../../models/RealEstateAsset");
const factory = require("../General/handlerFactory");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");



const createProperty = async (req, res) => {
  
  try {

    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }



  console.log(req.files)

  
    const imagePath = `/uploads/${req.files.image[0].filename}`; // Extract the image filename
    

    let fileUpload = []; // Initialize empty array

  if (req.files) {
    for (const key in req.files) {
      const fileArray = req.files[key]; // Array of files for each field
      for (const file of fileArray) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "expense_vouchers",
          resource_type: "raw",
        });
        console.log(result, "Cloudinary upload result");

        fileUpload.push({
          public_id: result.public_id,
          url: result.secure_url,
          name: result.original_filename,
        });
      }
    }
  }

  console.log(fileUpload, "Final uploaded files array");

    const newProperty = await Property.create({
      ...req.body,
      image: fileUpload,  // ✅ Save the correct image path
    });

    res.status(201).json({ success: true, data: newProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get a single property
// const getProperty = factory.getOne(Property);

const getProperty = async (req, res) => {
  const { propertyId } = req.params;

  console.log("Received propertyId:", propertyId); // Debugging

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid MongoDB ObjectId",
    });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// Get all properties
const getAllProperties = factory.getAll(Property);

// Update a property (including image)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: `No Property found with the ID ${req.params.propertyId}`,
      });
    }

    let fileUpload = []; // Initialize empty array

    if (req.files) {
      for (const key in req.files) {
        const fileArray = req.files[key]; // Array of files for each field
        for (const file of fileArray) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "expense_vouchers",
            resource_type: "raw",
          });
          console.log(result, "Cloudinary upload result");
  
          fileUpload.push({
            public_id: result.public_id,
            url: result.secure_url,
            name: result.original_filename,
          });
        }
      }
    }
  
    console.log(fileUpload, "Final uploaded files array");

    const updatedData = {
      ...req.body,
      image: fileUpload, // Use new image or keep old one
    };

    property = await Property.findByIdAndUpdate(req.params.propertyId, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a property
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: `No Property found with the ID ${req.params.propertyId}`,
      });
    }

    // Delete image from storage
    // if (property.image) {
    //   const imagePath = path.join(__dirname, "../../", property.image);
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }

    // Delete associated images from Cloudinary
    if (property.image && property.image.length > 0) {
      for (const file of property.image) {
        await cloudinary.uploader.destroy(file.public_id);
      }
    }

    await Property.findByIdAndDelete(req.params.propertyId);

    res.status(200).json({
      success: true,
      message: "Property successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Get properties by location
const getPropertiesByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    const properties = await Property.find({ location });

    res.status(200).json({
      success: true,
      results: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching properties by location" });
  }
};

// Get properties by type
const getPropertiesByType = async (req, res) => {
  try {
    const { type } = req.query;
    const properties = await Property.find({ type });

    res.status(200).json({
      success: true,
      results: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching properties by type" });
  }
};

module.exports = {
  createProperty,
  getProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getPropertiesByLocation,
  getPropertiesByType,
};

