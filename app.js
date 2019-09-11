const Hapi = require("hapi");
const Mongoose = require("mongoose");
const Joi = require("joi");


const server = new Hapi.Server({ "host": "localhost", "port": 3000 });

Mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log(`Error in DB connection : ${err}`)}
});

//Model definition
const BookModel = Mongoose.model("book", {
    bookname: String,
    authorname: String
});

//Home Route

//Home route
server.route({
    method: "GET",
    path: "/",
    handler: async (request, h) => {
        return "My Book Library";
    }
});

server.route({
    method: "POST",
    path: "/book",
    options: {
        validate: {
            payload: {
                bookname: Joi.string().required(),
                authorname: Joi.string().required()
            },
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
            }
        }
    },
    handler: async (request, h) => {
        try {
            var book = new BookModel(request.payload);
            var result = await book.save();
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.route({
    method: "GET",
    path: "/library",
    handler: async (request, h) => {
        try {
            var book = await BookModel.find().exec();
            return h.response(book);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.route({
    method: "GET",
    path: "/book/{id}",
    handler: async (request, h) => {
        try {
            var book = await BookModel.findById(request.params.id).exec();
            return h.response(book);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.route({
    method: "PUT",
    path: "/book/{id}",
    options: {
        validate: {
            payload: {
                bookname: Joi.string().optional(),
                authorname: Joi.string().optional()
            },
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
            }
        }
    },
    handler: async (request, h) => {
        try {
            var result = await BookModel.findByIdAndUpdate(request.params.id, request.payload, { new: true });
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.route({
    method: "DELETE",
    path: "/book/{id}",
    handler: async (request, h) => {
        try {
            var result = await BookModel.findByIdAndDelete(request.params.id);
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.start();