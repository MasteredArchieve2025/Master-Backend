const express = require("express");
const router = express.Router();

const {
  createAdvertisement,
  getAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
  getAdvertisementCategories,
  getAllAdvertisements
} = require("../../controllers/Advertisements/advertisementsController");


// ➕ Create
router.post("/", createAdvertisement);

// ⭐ NEW — Get ALL ads (must be before :category)
router.get("/all", getAllAdvertisements);

// 📌 Get ALL DISTINCT categories
router.get("/", getAdvertisementCategories);

// 📄 Get ads for a category + optional page ids
router.get("/:category", getAdvertisements);

// ✏ Update
router.put("/:id", updateAdvertisement);

// ❌ Delete
router.delete("/:id", deleteAdvertisement);


module.exports = router;
