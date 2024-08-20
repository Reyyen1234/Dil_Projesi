express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // To parse JSON bodies


const readJsonFile = (filePath, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: `Error reading ${filePath}` });
        }
        res.json(JSON.parse(data));
    });
};

// Function to write JSON data to a file
function writeJsonFile(filePath, newData, res) {
    // First, check if the file exists
    if (fs.existsSync(filePath)) {
        // Read existing data
        fs.readFile(filePath, 'utf8', (err, existingData) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                return res.status(500).json({ error: `Error reading file: ${err.message}` });
            }

            // Parse existing data and merge with the new data
            let jsonData;
            try {
                jsonData = JSON.parse(existingData);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                return res.status(500).json({ error: 'Error parsing existing JSON data.' });
            }

            // Merge existing data with new data
            const mergedData = { ...jsonData, ...newData };

            // Write the merged data back to the file
            fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(`Error writing file: ${writeErr.message}`);
                    return res.status(500).json({ error: `Error writing file: ${writeErr.message}` });
                }
                return res.json({ message: 'Language data saved successfully!' });
            });
        });
    } else {
        // File does not exist, create it with the new data
        fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(`Error creating file: ${err.message}`);
                return res.status(500).json({ error: `Error creating file: ${err.message}` });
            }
            return res.json({ message: 'Language data saved successfully!' });
        });
    }
}

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
app.get('/api/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    console.log(`Request received for type: ${type}, lang: ${lang}`);

    const filePath = path.join(__dirname, 'karcinDilSource', type, `${lang}.json`);
    console.log(`File path: ${filePath}`);

    readJsonFile(filePath, res);
});



app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    const data = req.body;

    let folder = type === 'client' || type === 'admin' ? `karcinDilSource/${type}` : `karcinDilSource/${type}`;
    const filePath = path.join(__dirname, folder, `${lang}.json`);

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        return res.status(400).json({ error: `Directory ${dirPath} does not exist` });
    }

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Error writing file' });
        }
        res.status(200).json({ message: `Language file ${lang}.json created successfully` });
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
//modul icin CRUD islemleri

 app.get('/api/modules', (req, res) => {
    const modulesPath = path.join(__dirname, 'karcinDilSource');

    fs.readdir(modulesPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading modules directory' });
        }
          // Only return directories (modules)
          const modules = files.filter(file => {
            return fs.statSync(path.join(modulesPath, file)).isDirectory();
        });
        res.json(modules);
    });
}); 



// Route to create a new module (like client/admin)
app.post('/api/create-module', (req, res) => {
    const { moduleName, includeNewLanguageFile } = req.body;

    if (!moduleName) {
        return res.status(400).json({ error: 'Module name is required' });
    }

    const modulesPath = path.join(__dirname, 'karcinDilSource', moduleName);

    if (fs.existsSync(modulesPath)) {
        return res.status(400).json({ error: 'Module already exists' });
    }

    try {
        fs.mkdirSync(modulesPath, { recursive: true });

        const trFilePath = path.join(modulesPath, 'tr.json');
        const enFilePath = path.join(modulesPath, 'en.json');

        fs.writeFileSync(trFilePath, JSON.stringify({}, null, 2), 'utf8');
        fs.writeFileSync(enFilePath, JSON.stringify({}, null, 2), 'utf8');

        if (includeNewLanguageFile) {
            const newLanguageFilePath = path.join(modulesPath, 'newLanguage.json');
            fs.writeFileSync(newLanguageFilePath, JSON.stringify({}, null, 2), 'utf8');
        }

        res.json({ message: 'Module created successfully' });
    } catch (err) {
        console.error('Error creating module:', err.message);
        res.status(500).json({ error: `Error creating module: ${err.message}` });
    }
});
app.post('/api/:moduleName/:lang/add-key', (req, res) => {
    const { moduleName, lang } = req.params;
    const { key, value } = req.body;
    const filePath = path.join(__dirname, 'karcinDilSource', moduleName, `${lang}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData = JSON.parse(data);
        jsonData[key] = value;

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to file');
            }

            res.send('Key added successfully');
        });
    });
});



// PUT route to update module name

app.put('/api/modules/:moduleName', (req, res) => {
    const oldModuleName = req.params.moduleName;
    const newModuleName = req.body.newModuleName;

    console.log(`Old Module Name: ${oldModuleName}`);
    console.log(`New Module Name: ${newModuleName}`);

    // Validate newModuleName
    if (!newModuleName || newModuleName.trim() === "") {
        return res.status(400).json({ error: "Please enter a new module name" });
    }

    const oldFolderPath = path.join(__dirname, 'karcinDilSource', oldModuleName);
    const newFolderPath = path.join(__dirname, 'karcinDilSource', newModuleName);

    fs.access(oldFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: `Module '${oldModuleName}' not found` });
        }

        fs.rename(oldFolderPath, newFolderPath, (err) => {
            if (err) {
                return res.status(500).json({ error: `Error renaming module: ${err.message}` });
            }
            return res.status(200).json({ message: `Module '${oldModuleName}' renamed to '${newModuleName}'` });
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



