const fs = require('fs');
const path = require('path');

const taskFilePath = path.join(__dirname, '../task.json');

// Helper to read tasks
const readTasks = () => {
    console.log("Start reading");
    // macrotask queue
    setImmediate(() => {
        console.log("This runs after I/O callbacks");
    });

    // macrotask queue
    setTimeout(() => {
        console.log("This runs after timer expires (min 1ms)");
    }, 0);
    
    // microtask queue
    process.nextTick(() => {
        console.log("This runs BEFORE the event loop continues!");
    });
    
    // await Promise.resolve().then(() => {
    //     console.log("This runs in microtask queue via Promise!");
    // });
    try {
        // queueing I/O operation
        const data = fs.readFileSync(taskFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading task file:', err);
        return { tasks: [] };
    }
};

// Helper to write tasks
const writeTasks = (data) => {
    try {
        fs.writeFileSync(taskFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing to task file:', err);
    }
};

module.exports = { readTasks, writeTasks };
