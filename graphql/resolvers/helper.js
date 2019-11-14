const userModel = require('../../models/user');
const eventModel = require('../../models/events');

const getEventsbyIds = async eventIds => {
    try {
        const evs = await eventModel.find({ _id : {$in: eventIds }});
        return evs.map( event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                createdBy: getUserByID.bind(this, event._doc.createdBy),
                bookedBy: getUsersByIDs.bind(this, event._doc.bookedBy)
            }
        })
    } catch (err) {
        console.log(err);
        throw err;
    }
}
const getEventbyId = async eventId => {
    try {
        const event = await eventModel.findOne({ _id : eventId });
        return {
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
            createdBy: getUserByID.bind(this, event._doc.createdBy),
            bookedBy: getUsersByIDs.bind(this, event._doc.bookedBy)
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const getUserByID = async userId => {
    try {
        
        const userResult = await userModel.findOne( { _id: userId });
        return {
            ...userResult._doc,
            _id: userResult.id,
            password: null,
            createdEvents: getEventsbyIds.bind(this, userResult._doc.createdEvents),
            bookedEvents: getEventsbyIds.bind(this, userResult._doc.bookedEvents)
        }
    } catch ( err ) {
        console.log(err);
        throw err;
    }
}

const getUsersByIDs = async userIds => {
    try {
        
        const users = await userModel.find( { _id: { $in: userIds} });
        return users.map( userResult => {
            return {
                ...userResult._doc,
                _id: userResult.id,
                password: null,
                createdEvents: getEventsbyIds.bind(this, userResult._doc.createdEvents),
                bookedEvents: getEventsbyIds.bind(this, userResult._doc.bookedEvents)
            }
        });
    } catch ( err ) {
        console.log(err);
        throw err;
    }
}

module.exports = {
    getEventsbyIds: getEventsbyIds,
    getEventbyId: getEventbyId,
    getUserByID: getUserByID,
    getUsersByIDs: getUsersByIDs
}