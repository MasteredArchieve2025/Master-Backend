const express = require("express");
const router = express.Router();

const {
  createAdvertisement,
  getAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
  getAdvertisementCategories
} = require("../../controllers/Advertisements/advertisementsController");

// ➕ Create
router.post("/", createAdvertisement);

// 📌 Get ALL DISTINCT categories  >>> MUST BE ABOVE /:category
router.get("/", getAdvertisementCategories);

// 📄 Get ads for a category + optional pages
router.get("/:category", getAdvertisements);

// ✏ Update
router.put("/:id", updateAdvertisement);

// ❌ Delete
router.delete("/:id", deleteAdvertisement);

module.exports = router;
