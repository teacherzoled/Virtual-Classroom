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
        
        // Provide feedback
        const formattedNumber = parseFloat(inputNumber).toLocaleString(undefined, {
            minimumFractionDigits: decimalPart.length,
            maximumFractionDigits: decimalPart.length
        });
        provideFeedback(`Great job! You've entered the number ${formattedNumber}.`, true);
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
    
    function provideFeedback(message, isCorrect) {
        feedbackElement.textContent = message;
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