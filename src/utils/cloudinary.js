const cloudinary = require("cloudinary");
const dotenv = require("dotenv").config();
const express = require("express");
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadMethod = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, (err, res) => {
      if (err) {
        reject({ err });
      }
      resolve({
        res: res.secure_url,
      });
    });
  });
};
module.exports = cloudinaryUploadMethod;
