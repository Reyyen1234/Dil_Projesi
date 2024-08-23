const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const moduleRoutes = require('./moduleRoutes');
const languageRoutes = require('./languageRoutes');

app.use(cors());
app.use(express.json()); // To parse JSON bodies



// Use the separated routes
app.use('/api', moduleRoutes);
app.use('/api', languageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
