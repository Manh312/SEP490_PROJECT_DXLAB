require('dotenv').config();
const express = require('express');
const server = express();
server.use(express.json());
const { TestController } = require('./controllers');
const { db } = require('./models');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const httpErrors = require("http-errors");
server.use(bodyParser.json());
server.use(morgan("dev"));
const cors = require('cors');
server.use(cors());
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// server.get('/api/movie/list', TestController.getMovieList);
// server.post('/api/movie/create', TestController.createMovie);
// server.get('/api/movie/by-star/:starId', TestController.getMovieListByStar);

server.use(async (req, res, next) => {
  next(httpErrors.NotFound());
});
server.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    }
  });
});


server.listen(process.env.PORT, 'localhost', () => {
  console.log('Server is running at ' + process.env.PORT);
  db.connectDB();
})