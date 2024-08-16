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
/* // Route to update a language in a specific folder (merging with existing data)
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
}); */

app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;  // "client", "admin", or "newLanguages"
    const lang = req.params.lang;  // New language identifier
    const data = req.body;

    console.log(`Type: ${type}, Language: ${lang}`);

    // Determine the correct folder path
    /* let folder;
    if (type === 'newLanguages') {
        folder = 'karcinDilSource/newLanguages';
    } else if (type === 'client' || type === 'admin') {
        folder = `karcinDilSource/${type}`;
    } else {
        return res.status(400).json({ error: 'Invalid type parameter' });
    } */
   // Determine the folder based on type
   let folder;
   if (type === 'client' || type === 'admin') {
       folder = `karcinDilSource/${type}`;
   } else {
       // Assume type is a module name
       folder = `karcinDilSource/${type}`;
   }
    const filePath = path.join(__dirname, folder, `${lang}.json`);

   /*  console.log(`File path: ${filePath}`); */

  /*   // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Directory created: ${dirPath}`);
        } catch (err) {
            console.error('Error creating directory:', err);
            return res.status(500).json({ error: 'Error creating directory' });
        }
    } */
     // Ensure the directory exists
     const dirPath = path.dirname(filePath);
     if (!fs.existsSync(dirPath)) {
         return res.status(400).json({ error: `Directory ${dirPath} does not exist` });
     }
 
     // Write the new language data to the file
     fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
         if (err) {
             console.error(`Error writing to ${filePath}:`, err);
             return res.status(500).json({ error: `Error writing to ${path.basename(filePath)}` });
         }
         res.status(200).json({ message: `Language successfully added to ${filePath}` });
     });
 });

   /*  // Write data to the new language file
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to ${filePath}:`, err);
            return res.status(500).json({ error: `Error writing to ${path.basename(filePath)}` });
        }

        console.log(`File created successfully: ${filePath}`);
        res.status(200).json({ message: `Data successfully written for ${path.basename(filePath)}` });
    });
}); */

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

        // Filter out any non-directory files (if needed)
        /* const directories = files.filter(file => fs.lstatSync(path.join(modulesPath, file)).isDirectory());

        res.status(200).json(directories); */
        const modules = files.filter(file => fs.statSync(path.join(modulesPath, file)).isDirectory());
        res.json(modules);
    });
});

// Route to create a new module (like client/admin)
app.post('/api/create-module', (req, res) => {
    const { moduleName, includeNewLanguageFile } = req.body;
  
    // Ensure the moduleName is provided
    if (!moduleName) {
        return res.status(400).json({ error: 'Module name is required' });
    }

    // Define the path for the new module
    const modulePath = path.join(__dirname, 'karcinDilSource', moduleName);

    // Check if the module already exists
    if (fs.existsSync(modulePath)) {
        return res.status(400).json({ error: 'Module already exists' });
    }
    try{
    // Create the module folder
        console.log(`Creating module directory at path: ${modulePath}`);
        fs.mkdirSync(modulePath, { recursive: true });
        console.log(`Module directory '${moduleName}' created successfully`);
    
        const trFilePath = path.join(modulePath, 'tr.json');
        const enFilePath = path.join(modulePath, 'en.json');
        
        fs.writeFileSync(trFilePath, JSON.stringify({}, null, 2), 'utf8');
        fs.writeFileSync(enFilePath, JSON.stringify({}, null, 2), 'utf8');
    
        /* console.log(`Creating 'tr.json' at ${trFilePath}`);
        fs.writeFileSync(trFilePath, JSON.stringify({}, null, 2), 'utf8');
        console.log(`'tr.json' created successfully`);
    
        console.log(`Creating 'en.json' at ${enFilePath}`);
        fs.writeFileSync(enFilePath, JSON.stringify({}, null, 2), 'utf8');
        console.log(`'en.json' created successfully`); */
    
        if (includeNewLanguageFile) {
            const newLanguageFilePath = path.join(modulePath, 'newLanguage.json');
            console.log(`Creating 'newLanguage.json' at ${newLanguageFilePath}`);
            fs.writeFileSync(newLanguageFilePath, JSON.stringify({}, null, 2), 'utf8');
            console.log(`'newLanguage.json' created successfully`);
        }
    
        return res.status(200).json({ message: `Module '${moduleName}' created successfully` });
     }catch (err) {
        console.error('Error creating module:', err.message, err.stack); // Enhanced logging
        return res.status(500).json({ error: `Error creating module: ${err.message}` });
    }

     
});















app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});