import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                const refreshToken = req.body.refreshToken;
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                    if (err) {
                        return res.json({ error: 'Unauthorized' });
                    }
                    const accessToken = jwt.sign(
                        { username: decoded.username, email: decoded.email, id: decoded.id },
                        process.env.JWT_SECRET_KEY,
                        { expiresIn: '15m' }
                    );
                    req.user = decoded;
                    req.accessToken = accessToken;
                    next();
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        res.json({ error: 'Unauthorized' });
    }
};



export const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                res.json('unauthorized');
            }
            if (decoded.role === 'admin') {
                req.admin = decoded;
                next();
            }
        });
    } else {
        res.json('unauthorized');
    }
};


export const verifyProviderToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                res.json('unauthorized');
            }
            req.provider = decoded;
            if (decoded.role === 'provider') {
                next();
            }
        });
    } else {
        res.json('unauthorized');
    }
};