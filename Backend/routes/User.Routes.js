const express = require("express");
const { UserModel } = require("../model/User.Model");
const { BlacklistModel } = require("../model/Blacklist.Model");
const { authenticate } = require("../middleware/Authenticate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRoutes = express.Router();

// /signup, /login, /logout

// Rota para cadastro
userRoutes.post("/signup", async (req, res) => {
    const { name, email, password, picture } = req.body;
    try {
        const userPresent = await UserModel.find({ email: email });
        if (userPresent.size > 0) {
            return res.status(400).json({ error: "Usuário já existente." });
        }

        const hashed_password = bcrypt.hashSync(password, 4);
        const user = new UserModel({
            name,
            email,
            password: hashed_password,
            picture,
        });
        await user.save();

        res.json({ success: "Usuário criado com sucesso" });
    } catch (error) {
        res.send({ error: "Algo deu errado", error: error.message });
    }
});

// Rota para login
userRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "Nome de usuário e senha incorretos" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: "Credenciais incorretas" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: 36000,
        });
        const reftoken = jwt.sign(
            { userId: user._id },
            process.env.REF_SECRET,
            { expiresIn: 30000 }
        );
        return res.status(200).json({
            success: "Usuário logado com sucesso",
            token: token,
            reftoken: reftoken,
            userId: user._id,
        });
    } catch (error) {
        res.send({ error: "Algo deu errado", error: error.message });
    }
});

// Rota para logout
userRoutes.get("/logout", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const blacklist = new BlacklistModel({ token });
    await blacklist.save();
    return res.status(200).json({ message: "Usuário deslogado com sucesso" });
});

// Rota para obter todos os usuários, exceto o usuário atual
userRoutes.get("/allUser", async (req, res) => {
    const { userId } = req.query;
    try {
        const users = await UserModel.find({
            _id: { $ne: userId },
        });
        res.send(users);
    } catch (error) {
        res.send(error.message);
    }
});

// Rota para obter usuários já conectados
userRoutes.get("/alreadyConnectedUser", async (req, res) => {
    const { userId } = req.query;
    try {
        const users = await UserModel.findOne({
            _id: userId,
        });
        let arr = users.chatMessageModel;
        let obj = {};
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].senderId == userId) {
                obj[arr[i].receiverId] = 1;
            } else {
                obj[arr[i].senderId] = 1;
            }
        }

        console.log(obj);
        let ans = [];
        for (key in obj) {
            const eleUser = await UserModel.findOne({
                _id: key,
            });
            ans.push(eleUser);
        }
        res.send([ans, users.name, users.picture]);
    } catch (error) {
        res.send(error.message);
    }
});

// Rota para pesquisar usuários
userRoutes.get("/searchUser", async (req, res) => {
    const { search, userId } = req.query;
    try {
        const users = await UserModel.find({
            _id: { $ne: userId },
            name: { $regex: search, $options: "i" },
        });
        res.send(users);
    } catch (error) {
        res.send(error.message);
    }
});

// Rota para atualizar o token de acesso
userRoutes.get("/apiRefresh", async (req, res) => {
    const reftoken = req.headers.authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(reftoken, process.env.REF_SECRET);
        const { userId } = decoded;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Não autorizado" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: 6000,
        });

        res.send({ token });
    } catch (error) {
        return res.status(403).json({ message: "Faça login primeiro" });
    }
});

// Obter todas as mensagens
userRoutes.get("/getAllMessages", async (req, res) => {
    const { user1, user2 } = req.query;
    try {
        const userChatData = await UserModel.findOne({ _id: user1 });
        const msgs = userChatData.chatMessageModel;
        let allData = [];
        for (let i = 0; i < msgs.length; i++) {
            if (msgs[i].senderId === user1 && msgs[i].receiverId === user2) {
                allData.push({ data: msgs[i], type: "enviado" });
            } else if (msgs[i].senderId === user2 && msgs[i].receiverId === user1) {
                allData.push({ data: msgs[i], type: "recebido" });
            }
        }
        res.send(allData);
    } catch (error) {
        res.send({ message: "Algo deu errado", error: error.message });
    }
});

// Rota para deletar mensagens de chat
userRoutes.put("/deleteChatMessages", async (req, res) => {
    const { sender, receiver } = req.body;
    try {
        const userChatData = await UserModel.updateOne(
            { _id: sender },
            {
                $pull: {
                    chatMessageModel: {
                        $or: [{ senderId: receiver, receiverId: receiver }],
                    },
                },
            }
        );

        res.send(userChatData);
    } catch (error) {
        res.send({ message: "Algo deu errado", error: error.message });
    }
});

module.exports = {
    userRoutes,
};
