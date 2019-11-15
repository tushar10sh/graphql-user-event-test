// import bcryptjs for hasing passwords
const bcrypt = require('bcryptjs');

// import mongoose models for controller logic
const userModel = require('../../models/user');
const eventModel = require('../../models/events');
const bookingModel = require('../../models/booking');

const getEventById = require('./helper').getEventbyId;
// import object response formatters
const { userResponse, eventResponse, bookingResponse } = require('./response');

// Single Object Resolvers
const event = async args => {
    try {
        const ev = await eventModel.findOne({ _id: args.eventId });
        return eventResponse(ev);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const user = async args => {
    try {
        const usr = await userModel.findOne({ _id: args.userId });
        return userResponse(usr);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const booking = async args => {
    try {
        const bking = await bookingModel.findOne({ _id: args.bookingId });
        return bookingResponse(bking);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// List of Objects Resolvers
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

// Object creation
const createEvent = async args => {
    try {
        const event = eventModel({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            // createdBy: '5dce9d804a349c33142ebb5e'
            createdBy: '5dceb7d8aea97728c657a0ab'
        });
        
        const result = await event.save();
        let createdEvent = eventResponse(result);
        const creator = await userModel.findOne({ _id: result.createdBy });
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
    let createdBooking;
    try {
        const event = await eventModel.findOne({ _id: args.eventId })
        if ( !event ) {
            throw new Error(`Event with id : ${args.eventId} not found`);
        }
        const booking = bookingModel({
            event: event,
            // user: '5dce9d804a349c33142ebb5e'
            user: '5dceb7d8aea97728c657a0ab'
        });
        createdBooking = await booking.save();
        const user = await userModel.findOne({_id: createdBooking._doc.user });
        if ( !user ) {
            throw new Error(`User : ${createdBooking.user.id} not found`);
        } else {
            const didUserBookEvent = event.bookedBy.filter( usrId => { 
                return usrId.toString() === user.id.toString();
            });
            if ( didUserBookEvent.length > 0 ) {
                throw new Error("User booked this event");
            } else {
                user.bookings.push(createdBooking);
                await user.save();
                event.bookedBy.push(user);
                await event.save();
            }
        }
        return bookingResponse(createdBooking);
    } catch (err) {
        if ( createdBooking ) {
            await bookingModel.deleteOne({ _id: createdBooking.id });
        }
        console.log(err);
        throw err
    }
}

// Object deletion
const cancelBooking = async args => {
    try {
        const booking = await bookingModel.findById(args.bookingId);
        if ( booking ) {
            console.log(booking._doc);
            const event = await eventModel.findById(booking._doc.event);
            const user  = await userModel.findById(booking._doc.user);
            if ( !event) {
                throw new Error("event not found");
            }
            if (!user) {
                throw new Error("user not found")
            }
            const updatedBookedBy = event.bookedBy.filter( usrId => { 
                return usrId.toString() !== user.id.toString() ;
            });
            
            await eventModel.updateOne({ _id: event.id }, { bookedBy: updatedBookedBy });
            const updatedBookings = user.bookings.filter ( bookingId => { 
                return bookingId.toString() !== booking.id.toString()
            });
            await userModel.updateOne({ _id: user.id }, { bookings: updatedBookings });
            await bookingModel.deleteOne({ _id: booking.id });
            return eventResponse(event);
        } else {
            throw new Error(`Booking with id: ${args.bookingId} not found `);
        }
    } catch (err) {
        console.log(err);
        throw err
    }
}
async function asyncForEach(array, callback) {
    for ( let index=0; index<array.length; index++) {
        await callback(array[index], index, array);
    }
}

const deleteUser = async args => {
    try {
        const user = await userModel.findOne({ email: args.email });
        if ( !user ) {
            throw new Error(`User with email: ${args.email} does not exist`);
        }
        const bookingIds = user.bookings;
        const createdEventIds = user.createdEvents;

        await asyncForEach( bookingIds, async bId => {
            const res = await cancelBooking({bookingId: bId});
        })

        await asyncForEach( createdEventIds, async evId => {
            const res = await deleteEvent({eventId: evId});
        });
        
        await userModel.deleteOne( { _id: user.id });
        return `User with email: ${args.email} deleted`;
    } catch (err) {
        console.log(err);
        throw err
    }
}

const deleteEvent = async args => {
    try { 
        const event = await eventModel.findById(args.eventId).populate("bookedBy");
        if (!event ) {
            throw new Error(`Event with id: ${args.eventId} does not exist`);
        }
        event.bookedBy.forEach( async booker => {
            const booking = await bookingModel.findOne( { user: booker.id, event: event.id });
            const updatedBookings = booker.bookings.filter( bId => {
                return bId.toString() !== booking.id.toString()
            })
            await userModel.updateOne({_id: booker.id}, { bookings: updatedBookings });
            await bookingModel.deleteOne({_id: booking.id });
        });
        const creator = await userModel.findById(event.createdBy);
        const updateCreatedEvents = creator.createdEvents.filter( eventId => {
            return eventId.toString() !== event.id.toString();
        })
        await userModel.updateOne({ _id: creator.id }, { createdEvents: updateCreatedEvents });
        await eventModel.deleteOne({ _id: event.id });
        return `Event with id: ${args.eventId} deleted`;
    } catch (err) {
        console.log(err);
        throw err
    }
}

module.exports = {
    events,
    users,
    bookings,
    event,
    user,
    booking,
    createEvent,
    createUser,
    bookEvent,
    cancelBooking,
    deleteUser,
    deleteEvent
}