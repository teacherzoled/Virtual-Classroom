/**
 * This function sets up the interactivity for the Carbon Footprint Calculator.
 */
function initializeCalculator() {
    const calculateBtn = document.getElementById('calculate-footprint-btn');
    const form = document.getElementById('calculator-form');
    const resultDisplay = document.getElementById('calculator-result-display');

    if (!calculateBtn || !form || !resultDisplay) {
        console.error("Calculator elements not found. Cannot initialize tool.");
        return;
    }

    calculateBtn.addEventListener('click', () => {
        let score = 0;
        const questionCount = 10;

        for (let i = 1; i <= questionCount; i++) {
            const question = form.querySelector(`input[name="q${i}"]:checked`);
            if (question) {
                score += parseInt(question.value);
            } else {
                alert(`Please answer question ${i}!`);
                return; // Stop the calculation if a question is unanswered
            }
        }

        displayResult(score);
    });

    function displayResult(score) {
        let resultHTML = '';
        if (score <= 15) {
            resultHTML = `
                <div class="calculator-result result-low">
                    <div class="result-icon">🌎</div>
                    <h2>Eco-Hero!</h2>
                    <p>Your carbon footprint is low. Great job making Earth-friendly choices!</p>
                </div>
            `;
        } else if (score <= 25) {
            resultHTML = `
                <div class="calculator-result result-medium">
                    <div class="result-icon">🌍</div>
                    <h2>Eco-Explorer!</h2>
                    <p>You're on the right track! There are still some simple changes you can make to help the planet even more.</p>
                </div>
            `;
        } else {
            resultHTML = `
                <div class="calculator-result result-high">
                    <div class="result-icon">🌏</div>
                    <h2>Eco-Challenger!</h2>
                    <p>There's a big opportunity for you to make a positive change! Start with small steps like turning off lights and recycling.</p>
                </div>
            `;
        }

        // Add a "Try Again" button to the result
        resultHTML += `<button id="reset-calculator-btn" class="button-secondary btn mt-4">Calculate Again</button>`;

        resultDisplay.innerHTML = resultHTML;
        resultDisplay.style.display = 'block';
        form.style.display = 'none';

        // Add event listener for the new "Try Again" button
        document.getElementById('reset-calculator-btn').addEventListener('click', () => {
            resultDisplay.style.display = 'none';
            form.style.display = 'block';
        });
    }
}

// Run the setup function for the calculator.
initializeCalculator();