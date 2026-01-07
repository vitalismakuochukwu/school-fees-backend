// backend/controllers/adminController.js
exports.updateFee = async (req, res) => {
  try {
    const { amount, level, secret } = req.body;

    // Optional: Check the secret key here
    if (secret !== process.env.ADMIN_SECRET) {
       return res.status(401).json({ message: "Invalid Secret Key" });
    }

    // Default level to "Year 1" if not provided
    const targetLevel = level || "Year 1";

    const updatedFee = await Fee.findOneAndUpdate(
      { level: targetLevel }, 
      { amount },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Fee updated!", fee: updatedFee });
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({ message: error.message });
  }
};