const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

// File akan dibuat di folder yang sama dengan EXE
const dbPath = path.join(process.cwd(), 'database.txt');

contextBridge.exposeInMainWorld('electronAPI', {
    initDB: () => {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, '[]', 'utf8');
        }
    },
    readDB: () => {
        try {
            if (fs.existsSync(dbPath)) {
                return fs.readFileSync(dbPath, 'utf8');
            }
            return '[]';
        } catch (e) {
            return '[]';
        }
    },
    saveDB: (content) => {
        try {
            fs.writeFileSync(dbPath, content, 'utf8');
            return true;
        } catch (e) {
            return false;
        }
    }
});