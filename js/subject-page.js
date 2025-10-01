/**
 * Initializes the functionality for a subject page, including tab switching and dynamic content loading.
 */
function initializeSubjectPage() {
    // --- Feature Card Click to Switch Tabs ---
    const featureCards = document.querySelectorAll('.feature-card');
    const tabContents = document.querySelectorAll('.tab-content');

    if (featureCards.length > 0 && tabContents.length > 0) {
        featureCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();

                // Update active state on cards
                featureCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Show the correct content section
                const targetId = card.getAttribute('href');
                tabContents.forEach(content => {
                    if (`#${content.id}` === targetId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    // --- Generic Content Loading Logic ---

    /**
     * A generic function to load HTML content into a view,
     * hide the corresponding list, and handle script loading.
     * @param {string} contentPath - The path to the HTML fragment to load.
     * @param {HTMLElement} listView - The element containing the list of items.
     * @param {HTMLElement} contentView - The element where the content will be displayed.
     */
    async function loadContent(contentPath, listView, contentView) {
        try {
            const response = await fetch(contentPath);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.statusText}`);
            }
            const contentHtml = await response.text();

            // Show the content view and hide the list
            listView.style.display = 'none';
            
            // Create a back button
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to List';
            backButton.className = 'button-secondary btn mb-4'; // Use your own classes
            backButton.onclick = () => {
                contentView.style.display = 'none';
                contentView.innerHTML = ''; // Clear content
                listView.style.display = 'block';
            };

            contentView.innerHTML = ''; // Clear previous content
            contentView.appendChild(backButton);
            contentView.insertAdjacentHTML('beforeend', contentHtml);
            contentView.style.display = 'block';

            // Check if the loaded content needs a script
            const contentWrapper = contentView.querySelector('[data-script]');
            if (contentWrapper) {
                const scriptPath = contentWrapper.dataset.script;
                if (scriptPath) {
                    // Dynamically import the content-specific script relative to the current page
                    // Use a root-relative path to ensure it works from any subject page.
                    // The path in data-script is relative to the /js/modules/ directory.
                    const rootRelativeScriptPath = `/js/modules/${scriptPath}`;
                    import(rootRelativeScriptPath).catch(err => console.error(`Failed to load script: ${rootRelativeScriptPath}`, err));
                }
            }

        } catch (error) {
            console.error('Error loading content:', error);
            contentView.innerHTML = `<p class="text-red">Sorry, there was an error loading this. Please try again later.</p>`;
            contentView.style.display = 'block';
        }
    }

    // --- Adjust data-script paths to be relative to the /js/modules/ folder ---
    document.querySelectorAll('a[data-content-src]').forEach(link => {
        link.dataset.contentSrc = `/js/modules/${link.dataset.contentSrc}`;
    });

    // --- Setup Event Listeners for all content types ---
    const contentTypes = ['lesson', 'tool', 'game', 'worksheet'];

    contentTypes.forEach(type => {
        const listView = document.getElementById(`${type}-list-view`);
        const contentView = document.getElementById(`${type}-content-view`);

        if (listView && contentView) {
            listView.querySelectorAll('a[data-content-src]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadContent(link.dataset.contentSrc, listView, contentView);
                });
            });
        }
    });
}

// Run the initialization function when the script is loaded.
initializeSubjectPage();