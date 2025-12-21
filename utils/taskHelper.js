const fs = require('fs').promises;
const path = require('path');

const taskFilePath = path.join(__dirname, '../task.json');

// Helper to read tasks (async)
const readTasks = async () => {
    try {
        const data = await fs.readFile(taskFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading task file:', err);
        return { tasks: [] };
    }
};

// Helper to write tasks (async)
const writeTasks = async (data) => {
    try {
        await fs.writeFile(taskFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing to task file:', err);
    }
};

module.exports = { readTasks, writeTasks };
