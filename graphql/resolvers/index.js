// import bcryptjs for hasing passwords
const bcrypt = require('bcryptjs');

// import mongoose models for controller logic
const userModel = require('../../models/user');
const eventModel = require('../../models/events');
const bookingModel = require('../../models/booking');

const getEventById = require('./helper').getEventbyId;
// import object response formatters
const { userResponse, eventResponse, bookingResponse } = require('./response');

const events = async () => {
    try {
        const evs = await eventModel.find();
        return evs.map( event => eventResponse(event) );
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const users = async () => {
    try {
        const usrs = await userModel.find();
        return usrs.map( user => userResponse(user) );
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const bookings = async () => {
    try {
        const bkings = await bookingModel.find();
        return bkings.map( booking => bookingResponse(booking))
    } catch (err) {

    }
}

const createEvent = async args => {
    try {
        const event = eventModel({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            // createdBy: '5dcceca11305db5ae6dc073f'
            createdBy: '5dcc6246e7ef3225a509607c'
        });
        
        const result = await event.save();
        let createdEvent = eventResponse(result);
        const creator = await userModel.findOne({ _id: result._doc.createdBy });
        if (!creator) {
            throw new Error("User doesnot exist for this event");
        }
        creator.createdEvents.push(event);
        await creator.save();
        return createdEvent;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const createUser = async args => {
    try {
        const existingUser = await userModel.findOne({ email: args.userInput.email });
        if ( existingUser ) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const userObj = userModel({
            email: args.userInput.email,
            password: hashedPassword
        });
        const userCreated = await userObj.save();
        return userResponse(userCreated)
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const bookEvent = async args => {
    try {
        const event = await eventModel.findOne({ _id: args.eventId })
        const booking = bookingModel({
            event: event,
            // user: '5dcceca11305db5ae6dc073f'
            user: '5dcc6246e7ef3225a509607c'
        });
        const createdBooking = await booking.save();
        return bookingResponse(createdBooking);
    } catch (err) {
        console.log(err);
        throw err
    }
}

const cancelBooking = async args => {
    try {
        const booking = await bookingModel.findById(args.bookingId);
        if ( booking ) {
            const event = await getEventById(booking._doc.event);
            await bookingModel.deleteOne({ _id: booking.id });
            return event;
        } else {
            throw new Error(`Booking with id: ${args.bookingId} not found `);
        }
    } catch (err) {
        console.log(err);
        throw err
    }
}

module.exports = {
    events,
    users,
    bookings,
    createEvent,
    createUser,
    bookEvent,
    cancelBooking
}