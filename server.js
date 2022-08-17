const express = require("express");
const dotenv = require("dotenv");
dotenv.config({})
const app = express();

const port = process.env.PORT || 5000;

app.listen(port,
()=>{
    console.log("Server is running on "+process.env.NODE_ENV+" PORT "+process.env.PORT);
}
)