const jwt = require('jsonwebtoken');


// ====================================================
// Verificar token
// ====================================================
let verificaToken = (req, res, next) => {

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

        // Esta función devuelve los datos del usuario logueado
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



// ====================================================
// Verificar token para IMG
// ====================================================

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    if (!token) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No tiene permiso para ver el recurso"
            }
        })
    }

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido.'
                }
            });
        }

        // Esta función devuelve los datos del usuario logueado
        req.usuario = decoded.usuario;
        next();
    });

}


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}