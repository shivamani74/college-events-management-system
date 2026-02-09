export const adminVerified = (req, res, next) => {
  if (
    req.user.role === "admin" &&
    !req.user.isVerified
  ) {
    return res.status(403).json({
      message: "Admin verification pending",
    });
  }
  next();
};
