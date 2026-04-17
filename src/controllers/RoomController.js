const roomSchema = require("../models/RoomModel")
const pgSchema = require("../models/PgModel")

const verifyRoomOwnership = async (roomId, userId) => {
    const room = await roomSchema.findById(roomId);
    if (!room) return { error: "Room not found", status: 404 };
    const pg = await pgSchema.findById(room.pgId);
    if (!pg) return { error: "PG not found", status: 404 };
    if (String(pg.ownerId) !== String(userId))
        return { error: "Access denied. You don't own this room's PG", status: 403 };
    return { room };
}

const manageRooms = async (req, res) => {
    try {
        // Verify the pgId in body belongs to this owner
        const pg = await pgSchema.findById(req.body.pgId);
        if (!pg) return res.status(404).json({ message: "PG not found" });
        if (String(pg.ownerId) !== String(req.user._id))
            return res.status(403).json({ message: "Access denied. You don't own this PG" });

        const savedRooms = await roomSchema.create(req.body)
        res.status(201).json({
            message: "Room details Saved",
            data: savedRooms
        })
    } catch(err) {
        res.status(500).json({
            message: "Error in room management",
            err: err
        })
    }
}

const getRooms = async(req, res) => {
    try {
        const { pgId } = req.query;

        if (pgId) {
            const pg = await pgSchema.findById(pgId);
            if (!pg) return res.status(404).json({ message: "PG not found" });
            
            // Allow owners and tenants (own PG)
            const isOwner = String(pg.ownerId) === String(req.user._id);
            const isTenant = req.user.role === 'tenant' && String(req.user.pgId) === String(pgId);
            const isAdmin = req.user.role === 'admin';
            
            if (!isOwner && !isTenant && !isAdmin) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions for this PG" });
            }
        }

        const query = pgId ? { pgId } : { };
        // If no pgId, only return rooms for PGs owned by this user
        if (!pgId) {
            const ownerPgs = await pgSchema.find({ ownerId: req.user._id }).select('_id');
            const pgIds = ownerPgs.map(pg => pg._id);
            query.pgId = { $in: pgIds };
        }

        const getRoomDetails = await roomSchema.find(query)
            .populate('pgId')
            .populate('occupants', 'fullName email roomId');
        res.status(200).json({
            message: "Room details fetched",
            data: getRoomDetails
        })
    } catch(err) {
        res.status(500).json({
            message: "error while getting room details",
            err: err
        })
    }
}

const updateRooms = async(req, res) => {
    try {
        const { error, status } = await verifyRoomOwnership(req.params.id, req.user._id);
        if (error) return res.status(status).json({ message: error });

        const updateDetails = await roomSchema.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json({
            message: "Rooms updated successfully",
            data: updateDetails
        })
    } catch(err) {
        res.status(500).json({
            message: "Error while updating Room",
            err: err
        })
    }
}

const deleteRooms = async(req, res) => {
    try {
        const { error, status } = await verifyRoomOwnership(req.params.id, req.user._id);
        if (error) return res.status(status).json({ message: error });

        const deleteDetail = await roomSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            data: deleteDetail
        })
    } catch(err) {
        res.status(500).json({
            message: "error while deleting Room",
            err: err
        })
    }
}

module.exports = {
    manageRooms,
    getRooms,
    updateRooms,
    deleteRooms
}
