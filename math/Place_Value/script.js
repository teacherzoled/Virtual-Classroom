document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const numberInput = document.getElementById('number-input');
    const visualizeBtn = document.getElementById('visualize-btn');
    const expandedFormElement = document.getElementById('expanded-form');
    const feedbackElement = document.getElementById('feedback-message');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    
    // Define place values and their multipliers
    const placeValues = [
        { place: 'hundred-millions', multiplier: 100000000 },
        { place: 'ten-millions', multiplier: 10000000 },
        { place: 'millions', multiplier: 1000000 },
        { place: 'hundred-thousands', multiplier: 100000 },
        { place: 'ten-thousands', multiplier: 10000 },
        { place: 'thousands', multiplier: 1000 },
        { place: 'hundreds', multiplier: 100 },
        { place: 'tens', multiplier: 10 },
        { place: 'ones', multiplier: 1 },
        { place: 'tenths', multiplier: 0.1 },
        { place: 'hundredths', multiplier: 0.01 },
        { place: 'thousandths', multiplier: 0.001 }
    ];
    
    // Separate whole number and decimal place values
    const wholeNumberPlaces = placeValues.slice(0, 9);
    const decimalPlaces = placeValues.slice(9);
    
    // Add event listeners
    visualizeBtn.addEventListener('click', visualizePlaceValues);
    numberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            visualizePlaceValues();
        }
    });
    
    // Input validation - only allow numbers and one decimal point
    numberInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const decimalPoints = this.value.match(/\./g);
        if (decimalPoints && decimalPoints.length > 1) {
            this.value = this.value.slice(0, this.value.lastIndexOf('.'));
        }
    });
    
    // Scroll buttons functionality
    scrollLeftBtn.addEventListener('click', function() {
        const chart = document.querySelector('.place-value-chart');
        chart.scrollLeft -= 100;
    });
    
    scrollRightBtn.addEventListener('click', function() {
        const chart = document.querySelector('.place-value-chart');
        chart.scrollLeft += 100;
    });
    
    function visualizePlaceValues() {
        // Clear previous visualization
        clearVisualization();
        
        // Get the input number
        const inputNumber = numberInput.value.trim();
        
        // Validate input
        if (!inputNumber) {
            provideFeedback('Please enter a number.', false);
            return;
        }
        
        if (!/^\d*\.?\d*$/.test(inputNumber)) {
            provideFeedback('Please enter a valid number.', false);
            return;
        }
        
        // Split the number into whole and decimal parts
        const parts = inputNumber.split('.');
        const wholeNumber = parts[0] || '0';
        const decimalPart = parts.length > 1 ? parts[1] : '';
        
        // Validate whole number length
        if (wholeNumber.length > 9) {
            provideFeedback('Please enter a whole number part with 9 or fewer digits.', false);
            return;
        }
        
        // Validate decimal part length
        if (decimalPart.length > 3) {
            provideFeedback('Please enter a decimal part with 3 or fewer digits.', false);
            return;
        }
        
        // Update visible place values based on the input number
        updateVisiblePlaceValues(wholeNumber, decimalPart);
        
        // Display digits in their place values
        displayDigits(wholeNumber, decimalPart);
        
        // Generate expanded form
        generateExpandedForm(wholeNumber, decimalPart);
        
        // Provide feedback in words
        provideFeedback(generateWordFeedback(wholeNumber, decimalPart), true);
    }
    
    function updateVisiblePlaceValues(wholeNumber, decimalPart) {
        // Hide all place value cells initially
        const allCells = document.querySelectorAll('.place-value-cell, .decimal-point');
        allCells.forEach(cell => {
            cell.classList.add('hidden');
        });
        
        // Show decimal point if there's a decimal part
        const decimalPoints = document.querySelectorAll('[data-place="decimal-point"]');
        if (decimalPart) {
            decimalPoints.forEach(point => point.classList.remove('hidden'));
        }
        
        // Determine which whole number place values to show
        const wholeNumberLength = wholeNumber.length;
        const startIndex = Math.max(0, 9 - wholeNumberLength);
        
        // Always show at least ones, tens, and hundreds
        const minWholeNumberIndex = Math.min(6, startIndex);
        
        // Show relevant whole number place values
        for (let i = minWholeNumberIndex; i < 9; i++) {
            const place = wholeNumberPlaces[i].place;
            const cells = document.querySelectorAll(`[data-place="${place}"]`);
            cells.forEach(cell => cell.classList.remove('hidden'));
        }
        
        // Determine which decimal place values to show
        const decimalLength = decimalPart.length;
        
        // Always show at least tenths
        const maxDecimalIndex = Math.max(1, decimalLength);
        
        // Show relevant decimal place values
        for (let i = 0; i < maxDecimalIndex; i++) {
            const place = decimalPlaces[i].place;
            const cells = document.querySelectorAll(`[data-place="${place}"]`);
            cells.forEach(cell => cell.classList.remove('hidden'));
        }
    }
    
    function displayDigits(wholeNumber, decimalPart) {
        // Get all visible place value cells
        const visibleWholeNumberCells = [];
        const visibleDecimalCells = [];
        
        // Collect visible whole number cells
        wholeNumberPlaces.forEach(placeValue => {
            const cell = document.querySelector(`.digits [data-place="${placeValue.place}"]`);
            if (cell && !cell.classList.contains('hidden')) {
                visibleWholeNumberCells.push({
                    cell: cell,
                    valueCell: document.querySelector(`.values [data-place="${placeValue.place}"]`),
                    multiplier: placeValue.multiplier
                });
            }
        });
        
        // Collect visible decimal cells
        decimalPlaces.forEach(placeValue => {
            const cell = document.querySelector(`.digits [data-place="${placeValue.place}"]`);
            if (cell && !cell.classList.contains('hidden')) {
                visibleDecimalCells.push({
                    cell: cell,
                    valueCell: document.querySelector(`.values [data-place="${placeValue.place}"]`),
                    multiplier: placeValue.multiplier,
                    precision: placeValue.place === 'tenths' ? 1 : (placeValue.place === 'hundredths' ? 2 : 3)
                });
            }
        });
        
        // Clear all cells first
        visibleWholeNumberCells.forEach(item => {
            item.cell.textContent = '';
            item.cell.classList.remove('highlight');
            item.valueCell.textContent = '';
            item.valueCell.classList.remove('highlight');
        });
        
        visibleDecimalCells.forEach(item => {
            item.cell.textContent = '';
            item.cell.classList.remove('highlight');
            item.valueCell.textContent = '';
            item.valueCell.classList.remove('highlight');
        });
        
        // Display whole number digits
        // We need to align digits from right to left (ones place first)
        for (let i = 0; i < wholeNumber.length; i++) {
            // Get position from right (0 = ones, 1 = tens, etc.)
            const positionFromRight = wholeNumber.length - 1 - i;
            
            // Get the corresponding cell from right to left
            const cellIndex = visibleWholeNumberCells.length - 1 - positionFromRight;
            
            // Skip if this position doesn't have a visible cell
            if (cellIndex < 0 || cellIndex >= visibleWholeNumberCells.length) {
                continue;
            }
            
            const item = visibleWholeNumberCells[cellIndex];
            const digit = parseInt(wholeNumber.charAt(i));
            
            // Display the digit
            item.cell.textContent = digit;
            
            // Calculate and display the place value
            if (digit > 0) {
                const placeValue = digit * item.multiplier;
                item.valueCell.textContent = placeValue.toLocaleString();
                
                // Highlight the cell
                item.cell.classList.add('highlight');
                item.valueCell.classList.add('highlight');
            }
        }
        
        // Display decimal digits
        // We need to align digits from left to right (tenths place first)
        for (let i = 0; i < decimalPart.length; i++) {
            // Skip if this position doesn't have a visible cell
            if (i >= visibleDecimalCells.length) {
                continue;
            }
            
            const item = visibleDecimalCells[i];
            const digit = parseInt(decimalPart.charAt(i));
            
            // Display the digit
            item.cell.textContent = digit;
            
            // Calculate and display the place value
            if (digit > 0) {
                const placeValue = digit * item.multiplier;
                item.valueCell.textContent = placeValue.toFixed(item.precision);
                
                // Highlight the cell
                item.cell.classList.add('highlight');
                item.valueCell.classList.add('highlight');
            }
        }
    }
    
    function generateExpandedForm(wholeNumber, decimalPart) {
        const terms = [];
        
        // Process whole number part
        for (let i = 0; i < wholeNumber.length; i++) {
            const digit = parseInt(wholeNumber.charAt(i));
            if (digit > 0) {
                const placeValue = Math.pow(10, wholeNumber.length - 1 - i);
                terms.push(`${digit} × ${placeValue.toLocaleString()}`);
            }
        }
        
        // Process decimal part
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart.charAt(i));
            if (digit > 0) {
                const placeValue = Math.pow(10, -(i + 1));
                terms.push(`${digit} × ${placeValue.toFixed(i + 1)}`);
            }
        }
        
        // Display expanded form
        if (terms.length > 0) {
            expandedFormElement.textContent = terms.join(' + ');
        } else {
            expandedFormElement.textContent = '0';
        }
    }
    
    function generateWordFeedback(wholeNumber, decimalPart) {
        const fragment = document.createDocumentFragment();

        if (wholeNumber === '0' && (!decimalPart || parseInt(decimalPart) === 0)) {
            fragment.appendChild(createSpan('Zero', 'one'));
            return fragment;
        }

        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const groups = ['', 'thousand', 'million'];

        function createSpan(text, type) {
            const span = document.createElement('span');
            span.textContent = text;
            span.style.padding = '2px 5px';
            span.style.borderRadius = '4px';
            span.style.margin = '0 2px';
            span.style.color = 'white';
            span.style.lineHeight = '2.2';
            span.style.display = 'inline-block';

            switch (type) {
                case 'hundred': span.style.backgroundColor = '#9b59b6'; break; // Purple
                case 'ten': span.style.backgroundColor = '#3498db'; break; // Blue
                case 'one': span.style.backgroundColor = '#2ecc71'; break; // Green
                case 'group': span.style.backgroundColor = '#2ecc71'; break; // Green
                case 'tenth': span.style.backgroundColor = '#f1c40f'; span.style.color = '#333'; break; // Yellow
                case 'hundredth': span.style.backgroundColor = '#e67e22'; break; // Orange
                case 'thousandth': span.style.backgroundColor = '#e74c3c'; break; // Red
            }
            return span;
        }

        function convertChunk(chunk) {
            const num = parseInt(chunk);
            if (num === 0) return [];
            const parts = [];
            const h = Math.floor(num / 100);
            const rest = num % 100;

            if (h > 0) {
                parts.push(document.createTextNode(ones[h] + ' '));
                parts.push(createSpan('hundred', 'hundred'));
            }

            if (rest > 0) {
                if (parts.length > 0) parts.push(document.createTextNode(' '));
                if (rest < 10) {
                    parts.push(createSpan(ones[rest], 'one'));
                } else if (rest < 20) {
                    parts.push(createSpan(teens[rest - 10], 'ten'));
                } else {
                    const t = Math.floor(rest / 10);
                    const o = rest % 10;
                    parts.push(createSpan(tens[t], 'ten'));
                    if (o > 0) {
                        parts.push(document.createTextNode('-'));
                        parts.push(createSpan(ones[o], 'one'));
                    }
                }
            }
            return parts;
        }

        // Whole number part
        if (wholeNumber && wholeNumber !== '0') {
            const padded = wholeNumber.padStart(Math.ceil(wholeNumber.length / 3) * 3, '0');
            const chunks = padded.match(/.{1,3}/g);
            
            chunks.forEach((chunk, i) => {
                const wordNodes = convertChunk(chunk);
                if (wordNodes.length > 0) {
                    if (fragment.childNodes.length > 0) fragment.appendChild(document.createTextNode(' '));
                    wordNodes.forEach(node => fragment.appendChild(node));
                    const groupName = groups[chunks.length - 1 - i];
                    if (groupName) {
                        fragment.appendChild(document.createTextNode(' '));
                        fragment.appendChild(createSpan(groupName, 'group'));
                    }
                }
            });
        }

        // Decimal part
        if (decimalPart && parseInt(decimalPart) > 0) {
            if (fragment.childNodes.length > 0) {
                fragment.appendChild(document.createTextNode(' and '));
            }
            const decimalWordNodes = convertChunk(parseInt(decimalPart).toString());
            decimalWordNodes.forEach(node => fragment.appendChild(node));

            const placeNames = ['tenth', 'hundredth', 'thousandth'];
            const placeName = placeNames[decimalPart.length - 1];
            if (placeName) {
                fragment.appendChild(document.createTextNode(' '));
                fragment.appendChild(createSpan(placeName + (parseInt(decimalPart) === 1 ? '' : 's'), placeName));
            }
        }

        // Capitalize first letter
        if (fragment.firstChild) {
            let targetNode = fragment.firstChild;
            if (targetNode.nodeType === Node.TEXT_NODE) {
                targetNode.textContent = targetNode.textContent.charAt(0).toUpperCase() + targetNode.textContent.slice(1);
            } else if (targetNode.nodeType === Node.ELEMENT_NODE) {
                targetNode.textContent = targetNode.textContent.charAt(0).toUpperCase() + targetNode.textContent.slice(1);
            }
        }

        return fragment;
    }

    function provideFeedback(message, isCorrect) {
        feedbackElement.innerHTML = ''; // Clear previous content
        if (typeof message === 'string') {
            feedbackElement.textContent = message;
        } else {
            feedbackElement.appendChild(message);
        }
        feedbackElement.className = isCorrect ? 'correct' : 'incorrect';
    }
    
    function clearVisualization() {
        // Clear all digit cells
        const digitCells = document.querySelectorAll('.digits .place-value-cell');
        digitCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('highlight');
        });
        
        // Clear all value cells
        const valueCells = document.querySelectorAll('.values .place-value-cell');
        valueCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('highlight');
        });
        
        // Clear expanded form and feedback
        expandedFormElement.textContent = '';
        feedbackElement.textContent = '';
    }
});

// Practice Mode
document.addEventListener('DOMContentLoaded', function() {
    /* Practice Mode Logic */
    if (!document.getElementById('practice-mode')) return;

    // --- DOM Elements ---
    const pm_startBtn = document.getElementById('pm_start-btn');
    const pm_startContainer = document.getElementById('pm_start-container');
    const pm_gameArea = document.getElementById('pm_game-area');
    const pm_roundDisplay = document.getElementById('pm_round');
    const pm_scoreDisplay = document.getElementById('pm_score');
    const pm_bestScoreDisplay = document.getElementById('pm_best-score');
    const pm_numberDisplay = document.getElementById('pm_number-display');
    const pm_dropZonesContainer = document.getElementById('pm_drop-zones');
    const pm_dropZones = Array.from(pm_dropZonesContainer.querySelectorAll('.pm_drop-zone'));
    const pm_tileRack = document.getElementById('pm_tile-rack');
    const pm_feedback = document.getElementById('pm_feedback');
    const pm_nextBtn = document.getElementById('pm_next-btn');
    const pm_resetBtn = document.getElementById('pm_reset-btn');
    const pm_quitBtn = document.getElementById('pm_quit-btn');

    // --- State Variables ---
    let pm_isPracticeActive = false;
    let pm_currentRound = 0;
    let pm_currentScore = 0;
    let pm_bestScore = 0;
    let pm_currentNumberString = '';
    const PM_MAX_ROUNDS = 10;

    // --- Functions ---
    function pm_init() {
        pm_startBtn.addEventListener('click', pm_startPractice);
        pm_nextBtn.addEventListener('click', pm_startNewRound);
        pm_resetBtn.addEventListener('click', pm_resetCurrentRound);
        pm_quitBtn.addEventListener('click', pm_quitPractice);

        pm_dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('drop', pm_dropHandler);
        });

        pm_loadBestScore();
        pm_updateScoreDisplay();
    }

    function pm_loadBestScore() {
        pm_bestScore = localStorage.getItem('pm_bestScore') || 0;
    }

    function pm_saveBestScore() {
        if (pm_currentScore > pm_bestScore) {
            pm_bestScore = pm_currentScore;
            localStorage.setItem('pm_bestScore', pm_bestScore);
        }
    }

    function pm_updateScoreDisplay() {
        pm_roundDisplay.textContent = pm_currentRound;
        pm_scoreDisplay.textContent = pm_currentScore;
        pm_bestScoreDisplay.textContent = pm_bestScore;
    }

    function pm_startPractice() {
        pm_isPracticeActive = true;
        pm_currentRound = 0;
        pm_currentScore = 0;
        pm_startContainer.classList.add('hidden');
        pm_gameArea.classList.remove('hidden');
        pm_startNewRound();
    }

    function pm_startNewRound() {
        pm_currentRound++;
        if (pm_currentRound > PM_MAX_ROUNDS) {
            pm_endPractice();
            return;
        }
        pm_resetBoard();
        pm_currentNumberString = pm_generateRandomNumber();
        pm_numberDisplay.textContent = pm_currentNumberString;
        pm_createTiles(pm_currentNumberString);
        pm_updateScoreDisplay();
    }

    function pm_generateRandomNumber() {
        const ones = Math.floor(Math.random() * 10);
        const numDecimalPlaces = Math.floor(Math.random() * 3) + 1;
        let decimalPart = '';
        for (let i = 0; i < numDecimalPlaces; i++) {
            decimalPart += Math.floor(Math.random() * 10);
        }
        const numStr = `${ones}.${decimalPart}`;
        if (parseFloat(numStr) === 0) return pm_generateRandomNumber();
        return numStr;
    }

    function pm_createTiles(numberString) {
        const tiles = numberString.split('').map(char => {
            const tile = document.createElement('div');
            tile.className = 'pm_tile';
            tile.textContent = char;
            tile.dataset.value = char;
            tile.draggable = true;
            tile.addEventListener('dragstart', pm_dragStart);
            tile.addEventListener('dragend', pm_dragEnd);
            return tile;
        });

        // Shuffle and append
        tiles.sort(() => Math.random() - 0.5).forEach(tile => pm_tileRack.appendChild(tile));
    }

    function pm_resetBoard() {
        pm_tileRack.innerHTML = '';
        pm_feedback.innerHTML = '';
        pm_nextBtn.classList.add('hidden');
        pm_resetBtn.classList.remove('hidden');
        pm_dropZones.forEach(zone => {
            zone.innerHTML = `<span class="pm_zone-label">${zone.dataset.place === 'decimal' ? '.' : zone.dataset.place.charAt(0).toUpperCase() + zone.dataset.place.slice(1)}</span>`;
            zone.classList.remove('pm_correct', 'pm_incorrect');
        });
    }

    function pm_resetCurrentRound() {
        pm_dropZones.forEach(zone => {
            const tile = zone.querySelector('.pm_tile');
            if (tile) {
                pm_tileRack.appendChild(tile);
                zone.innerHTML = `<span class="pm_zone-label">${zone.dataset.place === 'decimal' ? '.' : zone.dataset.place.charAt(0).toUpperCase() + zone.dataset.place.slice(1)}</span>`;
            }
        });
    }

    function pm_quitPractice() {
        pm_isPracticeActive = false;
        pm_gameArea.classList.add('hidden');
        pm_startContainer.classList.remove('hidden');
        pm_currentRound = 0;
        pm_currentScore = 0;
        pm_loadBestScore();
        pm_updateScoreDisplay();
    }

    function pm_endPractice() {
        pm_saveBestScore();
        pm_feedback.innerHTML = `Practice complete! Your final score is ${pm_currentScore} out of ${PM_MAX_ROUNDS}.`;
        pm_feedback.style.color = '#34495e';
        pm_nextBtn.classList.add('hidden');
        pm_resetBtn.classList.add('hidden');
    }

    // --- Drag & Drop Handlers ---
    function pm_dragStart(e) {
        e.target.classList.add('pm_dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.value);
        e.dataTransfer.effectAllowed = 'move';
    }

    function pm_dragEnd(e) {
        e.target.classList.remove('pm_dragging');
    }

    function pm_dropHandler(e) {
        e.preventDefault();
        const value = e.dataTransfer.getData('text/plain');
        const draggedTile = document.querySelector(`.pm_tile[data-value="${value}"].pm_dragging`);
        const targetZone = e.currentTarget;

        if (targetZone.children.length > 1) { // Already has a tile
            return;
        }
        targetZone.innerHTML = ''; // Clear label
        targetZone.appendChild(draggedTile);

        // Check if all tiles are dropped
        if (pm_tileRack.children.length === 0) {
            pm_checkAnswer();
        }
    }

    function pm_checkAnswer() {
        let isCorrect = true;
        const [whole, dec] = pm_currentNumberString.split('.');
        const expected = {
            'ones': whole,
            'decimal': '.',
            'tenths': dec?.[0] || null,
            'hundredths': dec?.[1] || null,
            'thousandths': dec?.[2] || null,
        };

        pm_dropZones.forEach(zone => {
            const place = zone.dataset.place;
            const tile = zone.querySelector('.pm_tile');
            const tileValue = tile ? tile.dataset.value : null;

            if (tileValue !== expected[place]) {
                isCorrect = false;
                zone.classList.add('pm_incorrect');
            } else {
                zone.classList.add('pm_correct');
            }
        });

        if (isCorrect) {
            pm_currentScore++;
            pm_feedback.textContent = 'Correct! Well done!';
            pm_feedback.style.color = '#27ae60';
        } else {
            pm_feedback.textContent = 'Not quite. The correct placement is shown above.';
            pm_feedback.style.color = '#e74c3c';
        }

        pm_updateScoreDisplay();
        pm_nextBtn.classList.remove('hidden');
        pm_resetBtn.classList.add('hidden');
    }

    // --- Initialization ---
    pm_init();
});
