require("dotenv").config();
const { UserModel } = require("../model/User.Model");
const { BlacklistModel } = require("../model/Blacklist.Model");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    try {
        // verifica se este token está bloqueado ou não
        const isBlocked = await BlacklistModel.findOne({ token });
        if (isBlocked) {
            return res.status(403).json({ message: "Faça login primeiro" });
        }

        // verifica se o token está expirado ou não
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Não autorizado" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError")
            return res.status(400).json({ message: "Token de acesso expirado" });
        else return res.status(400).json({ message: "Faça login primeiro!" });
    }
};

module.exports = { authenticate };
