const jwt = require('jsonwebtoken');


// ====================================================
// Verificar token
// ====================================================
let verficaToken = (req, res, next) => {

    let token = req.get('token'); //Lee de la cabecera

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido.'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
};

// ====================================================
// Verifica ADMIN role
// ====================================================
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === "ADMIN") {
        next();
    } else {
        return res.json({
            ok: false,
            usuario,
            err: {
                message: 'No tiene permisos de administrador.'
            }
        });
    }
};


module.exports = {
    verficaToken,
    verificaAdminRole
}