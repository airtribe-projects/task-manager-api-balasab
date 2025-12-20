const { readTasks, writeTasks } = require('../utils/taskHelper');

// GET /tasks: Retrieve all tasks with optional filtering and sorting
const getAllTasks = (req, res) => {
    const data = readTasks();
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
};

// GET /tasks/:id: Retrieve a specific task by ID
const getTaskById = (req, res) => {
    const data = readTasks();
    const taskId = parseInt(req.params.id);
    const task = data.tasks.find(t => t.id === taskId);

    if (task) {
        res.status(200).json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// GET /tasks/priority/:level: Retrieve tasks by priority level
const getTasksByPriority = (req, res) => {
    const { level } = req.params;
    const allowedPriorities = ['low', 'medium', 'high'];

    if (!allowedPriorities.includes(level)) {
        return res.status(400).json({ message: 'Invalid priority level. Must be low, medium, or high.' });
    }

    const data = readTasks();
    const tasks = data.tasks.filter(t => t.priority === level);
    res.status(200).json(tasks);
};

// POST /tasks: Create a new task
const createTask = (req, res) => {
    const { title, description, completed, priority } = req.body;

    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
    }
    if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ message: 'Description is required and must be a non-empty string.' });
    }
    if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Completed status is required and must be a boolean.' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const taskPriority = priority && validPriorities.includes(priority) ? priority : 'low';

    const data = readTasks();
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
    writeTasks(data);

    res.status(201).json(newTask);
};

// PUT /tasks/:id: Update an existing task
const updateTask = (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, completed, priority } = req.body;

    const data = readTasks();
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
            if (typeof completed !== 'boolean') {
                return res.status(400).json({ message: 'Completed status must be a boolean.' });
            }
            data.tasks[taskIndex].completed = completed;
        }

        if (priority !== undefined) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
            }
            data.tasks[taskIndex].priority = priority;
        }

        writeTasks(data);
        res.status(200).json(data.tasks[taskIndex]);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// DELETE /tasks/:id: Delete a task
const deleteTask = (req, res) => {
    const taskId = parseInt(req.params.id);
    const data = readTasks();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        data.tasks.splice(taskIndex, 1);
        writeTasks(data);
        res.status(200).json({ message: 'Task deleted successfully' });
    } else {
        res.status(404).json({ message: 'Task not found' });
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
