const Rooms = require("../Model/room.model")
const Room_User = require("../Model/room-user.model")
const Document = require("../Model/document.model")
const User = require("../Model/user.model")
const uuid = require("uuid")
const url = require("url");

exports.get_all_users = (req, res) => {
    const roomId = url.parse(req.url, true).query.roomId;

    Room_User.find({room_id: roomId})
        .then(users => {
            return Promise.all(users.map((item) => {
                return User.findOne({_id: item.user_id})
                    .then(user => ({
                        _id: user._id,
                        email: user.email
                    }))
            }))
        })
        .then(answer => {
            res.status(200).json({
                users: answer
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.get_all_tables = (req, res) => {
    const roomId = url.parse(req.url, true).query.roomId;

    Document.find({room_id: roomId})
        .then(tables => {
            const answer = tables.map((item) => ({
                id: item.id,
                name: item.name
            }))

            res.status(200).json({
                tables: answer
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.get_all_rooms = (req, res) => {
    Rooms.find({})
        .then(rooms => {
            res.status(200).json({
                tables: rooms
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.add_user = (req, res) => {
    User.findOne({_id: req.body.user_id})
        .then(user => {
            if (!user) {
                res.status(409).json({
                    message: `User not found`
                });
            } else {
                const roomId = url.parse(req.url, true).query.roomId;

                Room_User.create({room_id: roomId, user_id: req.body.user_id})
                    .then(() => {
                        res.status(200).json({
                            message: "ok"
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

exports.add_room = (req, res) => {
    const room_id = uuid.v4()
    const table_id = uuid.v4()
    Rooms.create({_id: room_id, name: req.body.name})
        .then(() => {
            Document.create({
                _id: table_id,
                room_id: room_id,
                name: "Table",
                data: null,
                columns: null
            })
                .then(() => {
                    Room_User.create({room_id: room_id, user_id: req.userData.userId})
                        .then(
                            res.status(200).json({
                                roomId: room_id,
                                tableId: table_id
                            })
                        )
                        .catch(err => {
                            console.log(err)
                            res.status(500).json({
                                error: err
                            })
                        })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}
