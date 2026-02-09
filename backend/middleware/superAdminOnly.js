const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "SuperAdmin access only" });
  }
  next();
};

export default superAdminOnly;
