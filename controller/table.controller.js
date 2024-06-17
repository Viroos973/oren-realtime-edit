const Rooms = require("../Model/room.model")
const Document = require("../Model/document.model")
const url = require("url");
const uuid = require("uuid");

exports.addTable = (req, res) => {
    const roomId = url.parse(req.url, true).query.roomId;

    Rooms.findOne({_id: roomId})
        .then(room => {
            if (!room) {
                res.status(409).json({
                    message: `Room not found`
                });
            } else {
                const tableId = uuid.v4()

                Document.create({
                    _id: tableId,
                    room_id: roomId,
                    name: req.body.name,
                    data: null,
                    columns: null
                })
                    .then(() => {
                        res.status(200).json({
                            tableId: tableId
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}