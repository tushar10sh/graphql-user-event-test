const { getEventsbyIds, getEventbyId, getUserByID, getUsersByIDs } = require('./helper');

const userResponse = user => {
    return {
        ...user._doc,
        _id: user.id,
        password: null,
        createdEvents: getEventsbyIds.bind(this, user._doc.createdEvents),
        bookedEvents: getEventsbyIds.bind(this, user._doc.bookedEvents)
    }
}

const eventResponse = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        createdBy: getUserByID.bind(this, event._doc.createdBy),
        bookedBy: getUsersByIDs.bind(this, event._doc.bookedBy)
    }
}

const bookingResponse = booking => {
    return {
        _id: booking.id,
        event: getEventbyId.bind(this, booking._doc.event),
        user: getUserByID.bind(this, booking._doc.user),
        createdAt: new Date(booking._doc.createdAt).toISOString(),
        updatedAt: new Date(booking._doc.updatedAt).toISOString()
    }
}
module.exports = {
    userResponse,
    eventResponse,
    bookingResponse
}