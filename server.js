const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const expressMongoSanitize = require("express-mongo-sanitize");
const bootcamps = require("./routers/v1/bootcamps");
const courses = require("./routers/v1/courses");
const auth = require("./routers/v1/auth");
const users = require("./routers/v1/users");
const reviews = require("./routers/v1/reviews");
const morgan = require("morgan");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const colors = require("colors");
const cors = require("cors");
const xssClean = require("xss-clean");
const fileuploader = require("express-fileupload");
const connectionDB = require("./config/db");
const errorHandler = require("./middleware/error");
dotenv.config({});

connectionDB();
const app = express();
// middlewares
app.use(express.json());
app.use(fileuploader());
app.use(cookieParser());
app.use(expressMongoSanitize());
app.use(xssClean());
app.use(helmet());
app.use(hpp());
app.use(cors());

// setting rate limit
const limitRate = rateLimit({
  windowMs: 10 * 60 * 1000, //10 min
  max: 100,
});
app.use(limitRate);
app.use(hpp());

// making public folder static
app.use(express.static(path.join(__dirname, "public")));

// app.use(logger);
// Only for development mode

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
// Error Handler
app.use(errorHandler);
// Port Name
const port = process.env.PORT || 5000;
// listening port
const server = app.listen(port, () => {
  console.log(
    "Server is running on " + process.env.NODE_ENV + " PORT " + process.env.PORT
  );
});

// Onhaving unhandled rejection

process.on("unhandledRejection", (err, promise) => {
  console.log(`${err.message}`.red.bold);
  server.close(() => process.exit(1));
});
