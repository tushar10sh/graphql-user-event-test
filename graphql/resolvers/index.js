// import bcryptjs for hasing passwords
const bcrypt = require('bcryptjs');

// import mongoose models for controller logic
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
                createdBy: getUserByID.bind(this, event._doc.createdBy)
            }
        })
    } catch (err) {
        console.log(err);
        // throw err;
    }
}
const getUserByID = async userId => {
    try {
        
        const userResult = await userModel.findOne( { _id: userId });
        return {
            ...userResult._doc,
            _id: userResult.id,
            password: null,
            createdEvents: getEventsbyIds.bind(this, userResult._doc.createdEvents)
        }
    } catch ( err ) {
        console.log(err);
        // throw err;
    }
}

const events = async () => {
    try {
        const evs = await eventModel.find();
        return evs.map( event => {
            
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                createdBy: getUserByID.bind(this, event._doc.createdBy)
            }
        });
    } catch (err) {
        console.log(err);
        // throw err;
    }
}

const createEvent = async args => {
    try {
        const event = eventModel({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            createdBy: '5dcc6246e7ef3225a509607c'
        });
        let createdEvent;
        const result = await event.save();
        createdEvent = {
            ...result._doc,
            _id: result.id,
            date: new Date(result._doc.date),
            createdBy: getUserByID.bind(this, result._doc.createdBy)
        }
        const creator = await userModel.findOne({ _id: result._doc.createdBy });
        if (!creator) {
            throw new Error("User doesnot exist for this event");
        }
        creator.createdEvents.push(event);
        await creator.save();
        return createdEvent;
    } catch (err) {
        console.log(err);
        // throw err;
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
        return {
            ...userCreated._doc,
            password: null,
            _id: userCreated.id
        }
    } catch (err) {
        console.log(err);
        // throw err;
    }
}

module.exports = {
    events,
    createEvent,
    createUser
}