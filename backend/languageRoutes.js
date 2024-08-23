const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const BASE_DIR = path.join(__dirname, 'karcinDilSource');

// Helper function to read JSON files
const readJsonFile = (filePath, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: `Error reading ${filePath}` });
        }
        res.json(JSON.parse(data));
    });
};
// Get available languages
router.get('/:userType/available-languages', (req, res) => {
    const { userType } = req.params;
    const userDir = path.join(BASE_DIR, userType);

    fs.readdir(userDir, (err, files) => {
        if (err) return res.status(500).send('Error reading directory');

        // Filter JSON files and remove file extension
        const languages = files
            .filter(file => file.endsWith('.json'))
            .map(file => path.basename(file, '.json'));

        res.json(languages);
    });
});

// Route to get data from client/en.json or client/tr.json
router.get('/client/:lang', (req, res) => {
    const lang = req.params.lang;
    const filePath = path.join(__dirname, 'karcinDilSource', 'client', `${lang}.json`);
    readJsonFile(filePath, res);
});

// Route to get data from admin/en.json or admin/tr.json
router.get('/admin/:lang', (req, res) => {
    const lang = req.params.lang;
    const filePath = path.join(__dirname, 'karcinDilSource', 'admin',`${lang}.json`);
    readJsonFile(filePath, res);
});

router.get('/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    console.log(`Request received for type: ${type}, lang: ${lang}`);

    const filePath = path.join(__dirname, 'karcinDilSource', type, `${lang}.json`);
    console.log(`File path: ${filePath}`);

    readJsonFile(filePath, res);
    
});

router.post('/:type/:lang', (req, res) => {
    const type = req.params.type;
    const lang = req.params.lang;
    const newLanguageData = req.body;
    const filePath = path.join(__dirname, 'karcinDilSource', type, `${lang}.json`);

    fs.writeFile(filePath, JSON.stringify(newLanguageData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Error writing file' });

        res.status(200).json({ message: 'Language created successfully' });
    });
});

// Route to delete a language file
router.delete('/:type/:lang', (req, res) => {
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

module.exports = router;