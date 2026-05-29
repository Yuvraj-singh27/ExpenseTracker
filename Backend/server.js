const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
const expensesRoutes = require('./routes/expense');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expensesRoutes); // Fixed: Added leading slash '/'

app.get("/", (req, res) => {
   res.send("Backend Server is Working!");
});

const port = 8080;
app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});