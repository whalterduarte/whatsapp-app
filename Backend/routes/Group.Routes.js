const express = require("express");
const { GroupModel } = require("../model/Group.Model");
const groupRoutes = express.Router();

// ROTAS - CRIAR GRUPO

// Rota para criar um grupo
groupRoutes.post("/createGroup", async (req, res) => {
    const { admin, groupOfUsers, groupName, groupImg } = req.body;

    try {
        const group = new GroupModel({
            admin,
            groupOfUsers,
            groupName,
            groupImg,
        });
        await group.save();
        res.send({ msg: "Grupo criado com sucesso", group });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

// Somente função => admin pode acessar esta rota
// Rota para adicionar membros a um grupo
groupRoutes.post("/addMembersToGroup", async (req, res) => {
    const { newMembersId, groupId, adminId } = req.body;
    try {
        const group = await GroupModel.updateOne(
            { $and: [{ _id: groupId }, { admin: adminId }] },
            { $push: { groupOfUsers: newMembersId } }
        );

        if (group.modifiedCount == 0) {
            res.status(401).send({ error: "Nenhum grupo encontrado" });
        } else res.send({ msg: "Usuário adicionado ao grupo com sucesso" });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

// Rota para remover membros de um grupo
groupRoutes.post("/removeGroupMember", async (req, res) => {
    const { adminId, removeUserId, groupId } = req.body;
    try {
        const group = await GroupModel.updateOne(
            { $and: [{ _id: groupId }, { admin: adminId }] },
            {
                $pull: { groupOfUsers: removeUserId },
            }
        );
        if (group.modifiedCount == 0)
            res.status(401).send({ error: "Não autorizado" });
        else res.send({ msg: "Usuário removido com sucesso" });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error.message });
    }
});

// Rota para deletar um grupo
groupRoutes.delete("/deleteGroup", async (req, res) => {
    const { adminId, groupId } = req.body;
    try {
        const group = await GroupModel.deleteOne({
            $and: [{ _id: groupId }, { admin: adminId }],
        });
        console.log(group);
        if (group.deletedCount == 0)
            res.status(401).send({ error: "Não autorizado" });
        else res.send({ msg: "Grupo deletado com sucesso" });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

// Rota para atualizar o nome e a imagem de perfil do grupo
groupRoutes.put("/updateGroup", async (req, res) => {
    try {
        const { groupId, img, name } = req.body;
        const group = await GroupModel.findOne({ _id: groupId });

        let newImg = img == undefined ? group.groupImg : img;
        let newName = name == undefined ? group.groupName : name;
        console.log(newName, newImg);
        await GroupModel.updateOne(
            { _id: groupId },
            { $set: { groupImg: newImg, groupName: newName } }
        );
        res.send({ msg: "Grupo atualizado com sucesso" });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

// Rota para enviar mensagem
groupRoutes.put("/sendMsg", async (req, res) => {
    const { groupId, msg, senderId, senderName } = req.body;

    try {
        await GroupModel.updateOne(
            { _id: groupId },
            {
                $push: { listOfMsg: { msg, senderId, senderName } },
            }
        );
        res.send({ msg: "Mensagem enviada com sucesso" });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

// Rota para sair de um grupo
groupRoutes.put("/leaveFromGroup", async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        await GroupModel.updateOne(
            { _id: groupId },
            { $pull: { groupOfUsers: userId } }
        );
        res.send({ msg: "Usuário saiu do grupo com sucesso." });
    } catch (error) {
        res.send({ msg: "Algo deu errado", error: error });
    }
});

module.exports = {
    groupRoutes,
};
