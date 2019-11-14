// Import packages dependencies
const express = require('express');
const expressGraphQL = require('express-graphql');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import code dependencies
const config = require('./config/config');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
// Instatiate express application

// Configure graphQL route
const app = express();

// use body parser middleware
app.use(bodyParser.json());

// Setup graphql endpoint
app.use('/graphql',expressGraphQL({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
}));

// Start application by binding to a port
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-vcz7b.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
).then( () => {
    app.listen(config.port, () => {
        console.log(`Server is running at port ${config.port}`);
    });
}).catch(err => {
    console.log(err);
    // throw err;
});