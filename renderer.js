const { ipcRenderer } = require('electron');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const timerMinutes = document.getElementById('timerMinutes');
const timerSeconds = document.getElementById('timerSeconds');
const modal = document.getElementById('myModal');
const dontShowAgainCheckbox = document.getElementById('dontShowAgain');

startBtn.addEventListener('click', () => {
    ipcRenderer.send('startApp');
    startBtn.style.display = 'none'; // Hide the Start button
    stopBtn.style.display = 'inline-block'; // Display the Stop button
});

stopBtn.addEventListener('click', () => {
    ipcRenderer.send('stopApp');
    stopBtn.style.display = 'none'; // Hide the Stop button
    startBtn.style.display = 'inline-block'; // Display the Start button
});

resetBtn.addEventListener('click', () => {
    ipcRenderer.send('stopApp');
    ipcRenderer.send('startApp');
})

ipcRenderer.on('updateTimer', (event, minutes, seconds) => {
    timerMinutes.textContent = minutes < 10 ? '0' + minutes : minutes;
    timerSeconds.textContent = seconds < 10 ? '0' + seconds : seconds;
});

const showModal = () => {
    modal.style.display = 'block';
};

const closeModal = () => {
    modal.style.display = 'none';
};

window.onload = () => { 
    localStorage.removeItem('hideModal');
    const shouldShowModal = !localStorage.getItem('hideModal');
    if (shouldShowModal) {
        showModal();
    }
};

// Close the modal when the user clicks on the close button
modal.querySelector('.close').addEventListener('click', () => {
    closeModal();
});
setTimeout(() => {
    clearTimeout();
    closeModal();
}, 3000)
// Save user preference when the checkbox is clicked
dontShowAgainCheckbox.addEventListener('change', () => {
    if (dontShowAgainCheckbox.checked) {
        localStorage.setItem('hideModal', 'true');
    } else {
        localStorage.removeItem('hideModal');
    }
});