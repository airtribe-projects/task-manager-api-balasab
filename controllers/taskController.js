const { readTasks, writeTasks } = require('../utils/taskHelper');

// GET /tasks: Retrieve all tasks with optional filtering and sorting
const getAllTasks = async (req, res) => {
    try {
        const data = await readTasks();
        let tasks = data.tasks;

        // Filtering by completion status
        if (req.query.completed) {
            const isCompleted = req.query.completed === 'true';
            tasks = tasks.filter(task => task.completed === isCompleted);
        }

        // Sorting by creation date
        if (req.query.sortBy === 'createdAt') {
            tasks.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateA - dateB;
            });
        }

        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /tasks/:id: Retrieve a specific task by ID
const getTaskById = async (req, res) => {
    try {
        const data = await readTasks();
        const taskId = parseInt(req.params.id, 10);
        if (Number.isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID. Must be a number.' });
        }
        const task = data.tasks.find(t => t.id === taskId);

        if (task) {
            res.status(200).json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /tasks/priority/:level: Retrieve tasks by priority level
const getTasksByPriority = async (req, res) => {
    try {
        const { level } = req.params;
        const allowedPriorities = ['low', 'medium', 'high'];

        if (!allowedPriorities.includes(level)) {
            return res.status(400).json({ message: 'Invalid priority level. Must be low, medium, or high.' });
        }

        const data = await readTasks();
        const tasks = data.tasks.filter(t => t.priority === level);
        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /tasks: Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, completed, priority } = req.body;

        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
        }
        if (typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ message: 'Description is required and must be a non-empty string.' });
        }
        if (completed === null || typeof completed !== 'boolean') {
            return res.status(400).json({ message: 'Completed status is required and must be a boolean.' });
        }

        const validPriorities = ['low', 'medium', 'high'];
        const taskPriority = (priority !== undefined && priority !== null && typeof priority === 'string' && validPriorities.includes(priority)) ? priority : 'low';

        const data = await readTasks();
        const newId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;
        const newTask = {
            id: newId,
            title,
            description,
            completed,
            priority: taskPriority,
            createdAt: new Date().toISOString()
        };

        data.tasks.push(newTask);
        await writeTasks(data);

        res.status(201).json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /tasks/:id: Update an existing task
const updateTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (Number.isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID. Must be a number.' });
        }
        const { title, description, completed, priority } = req.body;

        const data = await readTasks();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            // Validation for fields if provided
            if (title !== undefined) {
                if (typeof title !== 'string' || title.trim() === '') {
                    return res.status(400).json({ message: 'Title must be a non-empty string.' });
                }
                data.tasks[taskIndex].title = title;
            }

            if (description !== undefined) {
                if (typeof description !== 'string' || description.trim() === '') {
                    return res.status(400).json({ message: 'Description must be a non-empty string.' });
                }
                data.tasks[taskIndex].description = description;
            }

            if (completed !== undefined) {
                if (completed === null || typeof completed !== 'boolean') {
                    return res.status(400).json({ message: 'Completed status must be a boolean.' });
                }
                data.tasks[taskIndex].completed = completed;
            }

            if (priority !== undefined) {
                if (priority === null || typeof priority !== 'string') {
                    return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
                }
                const validPriorities = ['low', 'medium', 'high'];
                if (!validPriorities.includes(priority)) {
                    return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
                }
                data.tasks[taskIndex].priority = priority;
            }

            await writeTasks(data);
            res.status(200).json(data.tasks[taskIndex]);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /tasks/:id: Delete a task
const deleteTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (Number.isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID. Must be a number.' });
        }
        const data = await readTasks();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            data.tasks.splice(taskIndex, 1);
            await writeTasks(data);
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    getTasksByPriority,
    createTask,
    updateTask,
    deleteTask
};
