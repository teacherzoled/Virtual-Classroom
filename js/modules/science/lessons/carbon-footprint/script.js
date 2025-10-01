/**
 * This function sets up the interactivity for the Carbon Footprint lesson,
 * specifically the "Green Pledge" wall.
 */
function initializeLesson() {
    const addPledgeButton = document.getElementById('add-pledge-btn');
    const pledgeText = document.getElementById('pledge-text');
    const pledgeWall = document.getElementById('pledge-wall');

    // If elements aren't found, stop to prevent errors.
    if (!addPledgeButton || !pledgeText || !pledgeWall) {
        console.error("Pledge wall elements not found. Cannot initialize lesson interactivity.");
        return;
    }

    addPledgeButton.addEventListener('click', () => {
        const text = pledgeText.value.trim();
        if (text === '') {
            alert('Please write your pledge first!');
            return;
        }

        const pledgeCard = document.createElement('div');
        pledgeCard.classList.add('pledge-card');
        pledgeCard.textContent = text;
        pledgeWall.appendChild(pledgeCard);

        pledgeText.value = ''; // Clear the textarea
    });
}

// Run the setup function.
initializeLesson();