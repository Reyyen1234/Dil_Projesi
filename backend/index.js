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


app.post('/api/:type/:lang', (req, res) => {
    const type = req.params.type;  // "client", "admin", or "newLanguages"
    const lang = req.params.lang;  // New language identifier
    const data = req.body;

    console.log(`Type: ${type}, Language: ${lang}`);

   let folder;
   if (type === 'client' || type === 'admin') {
       folder = `karcinDilSource/${type}`;
   } else {
       // Assume type is a module name
       folder = `karcinDilSource/${type}`;
   }
    const filePath = path.join(__dirname, folder, `${lang}.json`);

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
        const modules = files.filter(file => fs.statSync(path.join(modulesPath, file)).isDirectory());
        res.json(modules);
    });
}); 
/* app.get('/api/modules/:moduleName', (req, res) => {
    const moduleName = req.params.moduleName;
    const folderPath = path.join(__dirname, 'karcinDilSource', moduleName);

    fs.access(folderPath, (err) => {
        if (err) {
            return res.status(404).json({ error: `Module '${moduleName}' not found` });
        }
        res.status(200).json({ message: `Module '${moduleName}' exists` });
    });
}); */



// Route to create a new module (like client/admin)
app.post('/api/create-module', (req, res) => {
    const { moduleName, includeNewLanguageFile } = req.body;
  
    // Ensure the moduleName is provided
    if (!moduleName) {
        return res.status(400).json({ error: 'Module name is required' });
    }

    // Define the path for the new module
    const modulesPath = path.join(__dirname, 'karcinDilSource', moduleName);

    // Check if the module already exists
    if (fs.existsSync(modulesPath)) {
        return res.status(400).json({ error: 'Module already exists' });
    }
    try{
    // Create the module folder
        console.log(`Creating module directory at path: ${modulesPath}`);
        fs.mkdirSync(modulesPath,(err)=>{
         return res.status(500).json({error:'Error creating module'})
        })/*  { recursive: true }); */
        console.log(`Module directory '${moduleName}' created successfully`);
    
        const trFilePath = path.join(modulesPath, 'tr.json');
        const enFilePath = path.join(modulesPath, 'en.json');
        
        fs.writeFileSync(trFilePath, JSON.stringify({}, null, 2), 'utf8');
        fs.writeFileSync(enFilePath, JSON.stringify({}, null, 2), 'utf8');
            if (includeNewLanguageFile) {
                const newLanguageFilePath = path.join(modulesPath, 'newLanguage.json');
                fs.writeFile(newLanguageFilePath, '{}', (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating new language file' });
                    }
    
                    return res.json({ message: 'Module and newLanguage.json created successfully' });
                });
            } else {
                res.json({ message: 'Module created successfully' });
            }
        /* return res.status(200).json({ message: `Module '${moduleName}' created successfully` }); */
     }catch (err) {
        console.error('Error creating module:', err.message, err.stack); // Enhanced logging
        return res.status(500).json({ error: `Error creating module: ${err.message}` });
    }

     
});

// PUT route to update module name
app.put('/api/modules/:moduleName', (req, res) => {
    const oldModuleName = req.params.moduleName;
    const newModuleName = req.body.newModuleName;
    
    const oldFolderPath = path.join(__dirname, 'karcinDilSource', oldModuleName);
    const newFolderPath = path.join(__dirname, 'karcinDilSource', newModuleName);

    // Check if the old module exists
    fs.access(oldFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: `Module '${oldModuleName}' not found` });
        }

        // Rename the directory
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



