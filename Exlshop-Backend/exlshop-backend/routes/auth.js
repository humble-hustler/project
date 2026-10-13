module.exports = {
    checkPermission: function (role) {
        return function (req, res, next) {
            if (role.indexOf(req.session.user.role_name) === -1) {
                return res.redirect('/403')
            } else {
                return next()
            }
        }
    }
}