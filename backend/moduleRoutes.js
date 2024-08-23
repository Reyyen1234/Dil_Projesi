const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const BASE_DIR = path.join(__dirname, 'karcinDilSource');

// Get available modules
router.get('/modules', (req, res) => {
    fs.readdir(BASE_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading modules directory' });
        }

        const modules = files.filter(file => fs.statSync(path.join(BASE_DIR, file)).isDirectory());
        res.json(modules);
    });
});

// Create a new module
router.post('/create-module', (req, res) => {
    const { moduleName, includeNewLanguageFile } = req.body;

    if (!moduleName) {
        return res.status(400).json({ error: 'Module name is required' });
    }

    const modulesPath = path.join(BASE_DIR, moduleName);

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
// Update module name
router.put('/modules/:moduleName', (req, res) => {
    const oldModuleName = req.params.moduleName;
    const newModuleName = req.body.newModuleName;

    if (!newModuleName || newModuleName.trim() === "") {
        return res.status(400).json({ error: "Please enter a new module name" });
    }

    const oldFolderPath = path.join(BASE_DIR, oldModuleName);
    const newFolderPath = path.join(BASE_DIR, newModuleName);

    fs.access(oldFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: `Module '${oldModuleName}' not found` });
        }

        fs.rename(oldFolderPath, newFolderPath, (err) => {
            if (err) {
                return res.status(500).json({ error: `Error renaming module: ${err.message}` });
            }
            res.status(200).json({ message: `Module '${oldModuleName}' renamed to '${newModuleName}'` });
        });
    });
});
router.post('/:moduleName/:lang/add-key', (req, res) => {
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


// Delete a module
router.delete('/modules/:moduleName', (req, res) => {
    const moduleName = req.params.moduleName;
    const modulePath = path.join(BASE_DIR, moduleName);

    if (!fs.existsSync(modulePath) || !fs.lstatSync(modulePath).isDirectory()) {
        return res.status(404).json({ error: `Module '${moduleName}' not found or is not a directory` });
    }

    fs.rm(modulePath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error(`Error deleting module '${moduleName}':`, err.message);
            return res.status(500).json({ error: `Error deleting module: ${err.message}` });
        }

        res.json({ message: `Module '${moduleName}' deleted successfully` });
    });
});

module.exports = router;
