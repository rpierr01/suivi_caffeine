document.addEventListener('DOMContentLoaded', () => {
    // === State ===
    let consumptions = [];
    let selectedCaffeine = null;
    let caffeineChart = null;
    const STORAGE_KEY = 'cafeine_aujourdhui';
    const LAST_ACCESS_KEY = 'cafeine_last_access_date';

    // === DOM Elements ===
    const coffeeBtns = document.querySelectorAll('.coffee-btn');
    const timeInput = document.getElementById('time');
    const validateBtn = document.getElementById('validate-btn');
    const historyList = document.getElementById('history-list');
    const totalConsumedSpan = document.getElementById('total-consumed');
    const warningBox = document.getElementById('warning-box');
    const activeCaffeineSpan = document.getElementById('active-caffeine');
    const safeBox = document.getElementById('safe-box');
    const activeCaffeineSafeSpan = document.getElementById('active-caffeine-safe');
    const resetBtn = document.getElementById('reset-btn');
    const chartCanvas = document.getElementById('caffeineChart');

    // === Initialization ===
    init();

    function init() {
        checkMidnightReset();
        loadData();
        render();
        setDefaultTime();
        updateValidateButton();
    }

    // === Event Listeners ===
    coffeeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectCoffee(btn);
        });
    });
    
    validateBtn.addEventListener('click', validateConsumption);
    resetBtn.addEventListener('click', resetDay);

    // === Functions ===

    function selectCoffee(btn) {
        // Remove selected class from all buttons
        coffeeBtns.forEach(b => b.classList.remove('selected'));
        
        // Add selected class to clicked button
        btn.classList.add('selected');
        
        // Store selected caffeine amount
        selectedCaffeine = parseInt(btn.getAttribute('data-caffeine'));
        
        // Update validate button state
        updateValidateButton();
    }

    function updateValidateButton() {
        if (selectedCaffeine && timeInput.value) {
            validateBtn.disabled = false;
        } else {
            validateBtn.disabled = true;
        }
    }

    // Update validate button when time changes
    timeInput.addEventListener('input', updateValidateButton);

    function validateConsumption() {
        if (!selectedCaffeine) {
            alert("Veuillez sélectionner un type de café.");
            return;
        }

        const time = timeInput.value;
        if (!time) {
            alert("Veuillez entrer une heure valide.");
            return;
        }

        addConsumption(selectedCaffeine);
        
        // Reset selection
        selectedCaffeine = null;
        coffeeBtns.forEach(b => b.classList.remove('selected'));
        updateValidateButton();
    }

    function setDefaultTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }

    function checkMidnightReset() {
        const lastAccess = localStorage.getItem(LAST_ACCESS_KEY);
        const today = new Date().toDateString();

        if (lastAccess !== today) {
            // New day, reset data
            consumptions = [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consumptions));
            localStorage.setItem(LAST_ACCESS_KEY, today);
        }
    }

    function loadData() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            consumptions = JSON.parse(storedData);
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consumptions));
        localStorage.setItem(LAST_ACCESS_KEY, new Date().toDateString());
    }

    function addConsumption(quantity) {
        const time = timeInput.value;

        const newConsumption = {
            quantity: quantity,
            time: time,
            id: Date.now()
        };

        consumptions.push(newConsumption);
        consumptions.sort((a, b) => a.time.localeCompare(b.time));

        saveData();
        render();

        setDefaultTime();
    }

    function resetDay() {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données d'aujourd'hui ?")) {
            consumptions = [];
            saveData();
            render();
        }
    }

    function calculateActiveCaffeine() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInHours = currentHours + (currentMinutes / 60);

        let totalActive = 0;

        consumptions.forEach(item => {
            const [h, m] = item.time.split(':').map(Number);
            const consumptionTimeInHours = h + (m / 60);

            // Calculate time elapsed
            let timeElapsed = currentTimeInHours - consumptionTimeInHours;

            // If the consumption is in the future (within the same day), it shouldn't contribute to active caffeine
            if (timeElapsed < 0) {
                timeElapsed = 0;
                return; // continue to next iteration, effectively adding 0
            }

            // Formula: Cafeine restante = quantité * (0.5^(temps_écoulé / 5))
            const remaining = item.quantity * Math.pow(0.5, timeElapsed / 5);
            totalActive += remaining;
        });

        return Math.round(totalActive);
    }

    function calculateCaffeineAtTime(targetHours) {
        let totalActive = 0;

        consumptions.forEach(item => {
            const [h, m] = item.time.split(':').map(Number);
            const consumptionTimeInHours = h + (m / 60);

            let timeElapsed = targetHours - consumptionTimeInHours;

            if (timeElapsed < 0) {
                return;
            }

            const remaining = item.quantity * Math.pow(0.5, timeElapsed / 5);
            totalActive += remaining;
        });

        return totalActive;
    }

    function generateChartData() {
        const now = new Date();
        const currentHours = now.getHours() + (now.getMinutes() / 60);
        
        const labels = [];
        const data = [];
        const backgroundColors = [];

        // Generate data points every hour starting from 6:00 for 24 hours
        for (let i = 0; i <= 24; i++) {
            const hours = (6 + i) % 24;
            
            const timeLabel = `${String(hours).padStart(2, '0')}:00`;
            
            labels.push(timeLabel);
            const caffeineLevel = calculateCaffeineAtTime(hours);
            data.push(caffeineLevel);
            
            // Color based on whether it's past or future
            if (hours <= currentHours) {
                backgroundColors.push('rgba(76, 175, 80, 0.6)'); // Green for past
            } else {
                backgroundColors.push('rgba(33, 150, 243, 0.4)'); // Blue for future projection
            }
        }

        return { labels, data, backgroundColors };
    }

    function renderChart() {
        const { labels, data, backgroundColors } = generateChartData();

        if (caffeineChart) {
            caffeineChart.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        caffeineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Caféine active (mg)',
                    data: data,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${Math.round(context.parsed.y)} mg`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' mg';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function render() {
        // Check for day change before rendering
        checkMidnightReset();

        // Render History
        historyList.innerHTML = '';
        let totalDaily = 0;

        consumptions.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.time} : ${item.quantity} mg`;
            historyList.appendChild(li);
            totalDaily += item.quantity;
        });

        // Render Totals
        totalConsumedSpan.textContent = `${totalDaily} mg`;

        // Render Active / Warning
        const activeCaffeine = calculateActiveCaffeine();

        if (activeCaffeine > 50) {
            activeCaffeineSpan.textContent = activeCaffeine;
            warningBox.classList.remove('hidden');
            safeBox.classList.add('hidden');
        } else {
            activeCaffeineSafeSpan.textContent = activeCaffeine;
            safeBox.classList.remove('hidden');
            warningBox.classList.add('hidden');
        }

        // Render Chart
        renderChart();
    }

    // Refresh calculations every minute to update "Active Caffeine" 
    // because time elapses even if no new input.
    setInterval(render, 60000);
});
