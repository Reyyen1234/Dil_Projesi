express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Helper functions
const readJsonFile = (filePath, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: `Error reading ${filePath}` });
        }
        res.json(JSON.parse(data));
    });
};

// Function to write JSON data to a file
const writeJsonFile = (filePath, data, res) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to ${filePath}:`, err);
            if (!res.headersSent) {
                return res.status(500).json({ error: `Error writing to ${path.basename(filePath)}` });
            }
        }
        if (!res.headersSent) {
            res.status(200).json({ message: `Data successfully written for ${path.basename(filePath)}` });
        }
        res.status(200).json({ message: `Data successfully written for ${path.basename(filePath)}` });
    });
};


// Route to get data from client/en.json or client/tr.json
app.get('/api/client/:lang', (req, res) => {
    const lang = req.params.lang;
    const filePath = path.join(__dirname, 'karcinDilSource', 'client', `${lang}.json`);
    readJsonFile(filePath, res);
});

// Route to get data from admin/en.json or admin/tr.json
app.get('/api/admin/:lang', (req, res) => {
    const lang = req.params.lang;
    const filePath = path.join(__dirname, 'karcinDilSource', 'admin',`${lang}.json`);
    readJsonFile(filePath, res);
});
// Route to update a language in a specific folder (merging with existing data)
app.put('/api/:type/:lang', (req, res) => {
    const type = req.params.type;  // "client" or "admin"
    const lang = req.params.lang;  // "en", "tr", or a new language
    const data = req.body;
    
    // Construct file path based on the language parameter
    const folder = `karcinDilSource/${type}`;
    const filePath = path.join(__dirname, folder, `${lang}.json`);

    // Read the existing file data and merge with new data
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            if (!res.headersSent) {
                return res.status(500).json({ error: `Error reading the JSON file for ${lang}` });
            }
        }

        let existingData;
        try {
            existingData = JSON.parse(fileData);
        } catch (parseError) {
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Error parsing the existing JSON data' });
            }
        }

        // Merge existing data with the new data
        const mergedData = { ...existingData, ...data };

        // Write the merged data back to the correct language file
        writeJsonFile(filePath, mergedData, res);
    });
});



// Route to add or update a language in a specific folder
/* app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;  // "client" or "admin"
    const lang = req.params.lang;  // "en", "tr", or a new language
    const data = req.body;
    
    // Construct file path based on the language parameter
    const folder = type === 'newLanguages' ? 'newLanguages' : `karcinDilSource/${type}`;
    const filePath = path.join(__dirname, folder, `${lang}.json`);
    if (lang === 'en' || lang === 'tr') {
        // If it's English or Turkish, only update the respective files in the appropriate folder
        const folder = `karcinDilSource/${type}`;
        const filePath = path.join(__dirname, folder, `${lang}.json`);
        
        // Write data to the respective language file
        writeJsonFile(filePath, data, res);
    } else {
        // If it's a new language, add it only to the newLanguages folder
        const folder = 'karcinDilSource/newLanguages';
        const filePath = path.join(__dirname, folder, `${lang}.json`);}
    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write data to the appropriate language file
    writeJsonFile(filePath, data, res);
});
 */
/* app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    const data = req.body;
    
    const folder = type === 'newLanguages' ? 'newLanguages' : `karcinDilSource/${type}`;
    const filePath = path.join(__dirname, folder, `${lang}.json`);

    console.log('Creating directory if not exists:', filePath);

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        try{
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
    }catch (err) {
        console.error('Error creating directory:', err);
        return res.status(500).json({ error: 'Error creating directory' });}
    }

    console.log('Writing data to file:', filePath);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            console.log('Headers sent:', res.headersSent);
            if (!res.headersSent) {
                return res.status(500).json({ error: `Error writing to ${path.basename(filePath)}` });
            }
        } else {
            console.log('Data written successfully');
            if (!res.headersSent) {
                res.status(200).json({ message: `Data successfully written for ${path.basename(filePath)}` });
            }
        }
    });
}); */
app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;  // "client", "admin", or "newLanguages"
    const lang = req.params.lang;  // New language identifier
    const data = req.body;

    console.log(`Type: ${type}, Language: ${lang}`);

    // Determine the correct folder path
    let folder;
    if (type === 'newLanguages') {
        folder = 'karcinDilSource/newLanguages';
    } else if (type === 'client' || type === 'admin') {
        folder = `karcinDilSource/${type}`;
    } else {
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
    const filePath = path.join(__dirname, folder, `${lang}.json`);

    console.log(`File path: ${filePath}`);

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Directory created: ${dirPath}`);
        } catch (err) {
            console.error('Error creating directory:', err);
            return res.status(500).json({ error: 'Error creating directory' });
        }
    }

    // Write data to the new language file
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to ${filePath}:`, err);
            return res.status(500).json({ error: `Error writing to ${path.basename(filePath)}` });
        }

        console.log(`File created successfully: ${filePath}`);
        res.status(200).json({ message: `Data successfully written for ${path.basename(filePath)}` });
    });
});

// Route to delete a language file
app.delete('/api/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    const folder = type === 'newLanguages' ? 'newLanguages' : `karcinDilSource/${type}`;
    const filePath = path.join(__dirname, folder, `${lang}.json`);

    fs.unlink(filePath, (err) => {
        if (err) {
            if (!res.headersSent) {
                return res.status(500).json({ error: `Error deleting ${filePath}` });
            }
        }
        if (!res.headersSent) {
            res.status(200).json({ message: `File ${filePath} deleted successfully` });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});