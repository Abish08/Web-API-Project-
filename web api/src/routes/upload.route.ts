import { Router } from "express";
import { UserCollection } from "../models/user.model"; 
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import path from "path";
import fs from "fs";

const router = Router();

// Upload profile picture
router.post("/profile-picture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const userId = (req as AuthRequest).user!.id;
    
    // Delete old profile picture if exists
    const user = await UserCollection.findById(userId); 
    if (user && user.profilePicture?.publicId) {
      const oldFilePath = path.join(__dirname, "../../uploads", user.profilePicture.publicId);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new profile picture
    const updatedUser = await UserCollection.findByIdAndUpdate( 
      userId,
      {
        profilePicture: {
          url: `/uploads/${req.file.filename}`,
          publicId: req.file.filename,
        },
      },
      { new: true }
    ).select("-password");

    res.status(200).json({ 
      success: true, 
      message: "Profile picture updated successfully",
      data: updatedUser 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete profile picture
router.delete("/profile-picture", authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    
    const user = await UserCollection.findById(userId); 
    if (user && user.profilePicture?.publicId) {
      const filePath = path.join(__dirname, "../../uploads", user.profilePicture.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await UserCollection.findByIdAndUpdate(userId, { 
        profilePicture: undefined 
      });
    }

    res.status(200).json({ success: true, message: "Profile picture deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;