import express from 'express';
import fs from 'fs';
import path from 'path';

const genericRoutes = express.Router();
const fsPromises = fs.promises;

async function createController() {
    const directoryPath = './app/models';
    const files = await fsPromises.readdir(directoryPath);

    files.forEach(async (file) => {

        const model = await import('../models/' + file.replace('.ts', ''));
        console.log(model);
        // Do whatever you want to do with the file
        console.log(file);
    });
    return genericRoutes;
}
export default createController;
