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

// 📄 Get (with smart fallback: category + optional page ids)
router.get("/:category", getAdvertisements);

// ✏ Update
router.put("/:id", updateAdvertisement);

// ❌ Delete
router.delete("/:id", deleteAdvertisement);

// 📌 Get distinct categories
router.get("/", getAdvertisementCategories);

module.exports = router;
