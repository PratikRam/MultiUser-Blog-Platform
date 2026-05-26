require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = 8080;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.get("/", (req, res) => {
    res.send("Welcome to the blog platform");
});