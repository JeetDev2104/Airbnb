const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.newlisting= (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showlisting= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: 'reviews',
        populate: { path: 'author' }
      })
      .populate('owner');
    if (!listing) {
      req.flash('error', 'Listing you requested for does not exist');
      return res.redirect('/listings');
    }
    res.render('./listings/show.ejs', { listing });
  };

module.exports.createlisting =async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image= {url, filename};
    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
}

module.exports.editlisting =  async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing you requested for does not exist');
      return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
  };

  module.exports.updatelisting = async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    try {
        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

        // Authorization check
        if (!existingListing.owner._id.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to edit this listing');
            return res.redirect(`/listings/${id}`);
        }

        // Update image only if a new file is uploaded
        if (req.file) {
            listingData.image = { url: req.file.path, filename: req.file.filename };
        }

        // Update listing with new data
        const updatedListing = await Listing.findByIdAndUpdate(id, listingData, { new: true });
        await updatedListing.save();
        req.flash('success', 'Listing updated successfully');
        res.redirect(`/listings/${updatedListing._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update the listing');
        res.redirect(`/listings/${id}`);
    }
};

module.exports.deletelisting = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
  };

  