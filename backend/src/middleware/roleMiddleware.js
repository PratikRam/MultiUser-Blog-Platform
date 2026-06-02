const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                message: "Access denied",
            });
        }
        const userRoleLower = req.user.role.toLowerCase();
        const allowedRolesLower = roles.map(r => r.toLowerCase());
        if (!allowedRolesLower.includes(userRoleLower)) {
            return res.status(403).json({
                message: "Access denied",
            });
        }
        next();
    };
};

module.exports = checkRole;