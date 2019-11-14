const { buildSchema } = require('graphql');
module.exports = buildSchema(`
type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}
type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
    bookedEvents: [Event!]
}
type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
    createdBy: User!
    bookedBy: [User!]
}

input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
}

input UserInput {
    email: String!
    password: String!
}

type Query {
    events: [Event!]!
    users: [User!]!
    bookings: [Booking!]!
}

type Mutation {
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
}
`)