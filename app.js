const express = require('express');
const cluster = require('cluster');
const os = require('os');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        pid: process.pid,
        uptime: process.uptime()
    });
});

app.use('/tasks', taskRoutes);

// Only handle clustering if executed directly (not required by tests)
if (require.main === module) {
    const numCPUs = os.cpus().length;

    if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            // Replace the dead worker
            cluster.fork();
        });
    } else {
        // Workers share the TCP connection in this server
        app.listen(port, () => {
            console.log(`Worker ${process.pid} started`);
        });
    }
}

module.exports = app;
