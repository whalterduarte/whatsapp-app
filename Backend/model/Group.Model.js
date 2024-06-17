const mongoose = require("mongoose");
const groupSchema = new mongoose.Schema(
    {
        roomId: {
            type: Date,
            default: Date.now(),
        },
        admin: {
            type: String,
        },
        groupOfUsers: [],
        listOfMsg: [
            {
                msg: {
                    type: String,
                },
                senderId: {
                    type: String,
                },
                senderName: {
                    type: String,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        groupName: {
            type: String,
        },
        groupImg: {
            type: String,
            default:
                "https://media.licdn.com/dms/image/D4E0BAQH1jhtZ5rvJpw/company-logo_100_100/0/1696956457438/trendbuild_solucoes_em_atendimento_logo?e=1726704000&v=beta&t=CVuDf00SBLVKMq1jwGBtKDAqmGwyI9-A58Bd5ORf0KE",
        },
    },
    {
        timestamps: true,
    }
);

const GroupModel = mongoose.model("group", groupSchema);

module.exports = {
    GroupModel,
};
