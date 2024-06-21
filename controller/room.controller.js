const Rooms = require("../Model/room.model")
const Room_User = require("../Model/room-user.model")
const Document = require("../Model/document.model")
const User = require("../Model/user.model")
const uuid = require("uuid")

exports.get_all_users = (req, res) => {
    Room_User.find({room_id: req.query.roomId})
        .then(users => {
            return Promise.all(users.map((item) => {
                return User.findOne({_id: item.user_id})
                    .then(user => ({
                        _id: user._id,
                        username: user.username,
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
    Document.find({room_id: req.query.roomId})
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
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                res.status(409).json({
                    message: `User not found`
                });
            }
            else {
                Rooms.findOne({_id: req.query.roomId})
                    .then(room => {
                        if (!room) {
                            res.status(404).json({
                                error: "Room not found"
                            })
                        }
                        else if (room.creator !== req.userData.userId) {
                            res.status(400).json({
                                error: "You aren't an admin"
                            })
                        }
                        else {
                            Room_User.create({room_id: req.query.roomId, user_id: user._id})
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
    Rooms.create({_id: room_id, name: req.body.name, creator: req.userData.userId})
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

exports.rename_room = (req, res) => {
    Rooms.findOne({_id: req.query.roomId})
        .then(room => {
            if (!room) {
                throw new Error('Room not found');
            }
            else if (room.creator !== req.userData.userId) {
                throw new Error("You aren't an admin");
            }

            room.name = req.body.name
            return room.save()
        })
        .then(savedRooms => {
            res.status(200).json({
                message: `Room updated successfully`
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err.message
            });
        });
}

exports.room_delete = (req, res) => {
    Rooms.findOne({_id: req.query.roomId})
        .then( room => {
            if (room.creator !== req.userData.userId) {
                res.status(400).json({
                    error: "You aren't an admin"
                })
            }
            else if (room) {
                Rooms.deleteOne({ _id: room._id })
                    .then(result => {
                        res.status(200).json({
                            message: `User deleted successfully!`
                        })
                    }).catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
            }
            else {
                res.status(404).json({
                    error: "Room not found"
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

exports.delete_room_users = (req, res) => {
    Room_User.findOne({room_id: req.query.roomId, user_id: req.query.user_id})
        .then(room_user => {
            if (!room_user) {
                res.status(404).json({
                    error: "User not found"
                })
            }
            else {
                Rooms.findOne({_id: room_user.room_id})
                    .then(room => {
                        if (room.creator !== req.userData.userId && req.userData.userId === room_user.user_id) {
                            Room_User.deleteOne({ _id: room_user._id })
                                .then(result => {
                                    res.status(200).json({
                                        message: `User deleted successfully!`
                                    })
                                }).catch(err => {
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        }
                        else if (room.creator !== req.userData.userId) {
                            res.status(400).json({
                                error: "You aren't an admin"
                            })
                        }
                        else if (req.userData.userId === room_user.user_id) {
                            res.status(400).json({
                                error: "You can't delete yourself"
                            })
                        }
                        else {
                            Room_User.deleteOne({ _id: room_user._id })
                                .then(result => {
                                    res.status(200).json({
                                        message: `User deleted successfully!`
                                    })
                                }).catch(err => {
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}