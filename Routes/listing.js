const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../utils/middleware.js");
const listingController = require("../controllers/listing.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};
const multer= require("multer");
const{storage}= require("../cloudConfig.js");
const upload = multer({ storage });
router.route("/listings")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single("listing[image][url]"),
  wrapAsync(listingController.createlisting)
);
//New Route
router.get("/listings/new", isLoggedIn, listingController.newlisting);


router.route("/listings/:id")
.get(wrapAsync(listingController.showlisting))
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image][url]"),
  wrapAsync(listingController.updatelisting)
)
.delete(
  isLoggedIn,
  wrapAsync(listingController.deletelisting)
);


//Show Route
// Show Route

//Edit Route
router.get(
  "/listings/:id/edit",
  isLoggedIn,
  wrapAsync(listingController.editlisting)
);
//Update Route

//Search Route
router.get("/search", async (req, res) => {
  try {
    let query = req.query.country;
    console.log("Search Query:", query); // Debugging: Log user input

    if (!query) {
      console.log("No search query provided. Redirecting...");
      return res.redirect("/listings"); // Redirect if search is empty
    }

    // Search listings where country name matches the query (case-insensitive)
    const filteredListings = await Listing.find({
      country: { $regex: new RegExp(query, "i") },
    });

    console.log("Found Listings:", filteredListings.length); // Debugging: Log results

    res.render("listings/index", { allListings: filteredListings });
  } catch (err) {
    console.error("Error in search route:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
