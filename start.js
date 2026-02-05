const { spawn } = require('child_process');

// Start backend server
const backend = spawn('node', ['index.js'], {
    cwd: './server',
    stdio: 'inherit',
    shell: true
});

backend.on('error', (error) => {
    console.error('Backend error:', error);
});

backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
});

// Start frontend server after a delay
setTimeout(() => {
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: './client',
        stdio: 'inherit',
        shell: true
    });

    frontend.on('error', (error) => {
        console.error('Frontend error:', error);
    });

    frontend.on('close', (code) => {
        console.log(`Frontend process exited with code ${code}`);
    });
}, 3000);