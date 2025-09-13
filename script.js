document.addEventListener('DOMContentLoaded', () => {

    // --- State & Variables ---
    let currentScreen = 'screen-main';
    const appContainer = document.getElementById('app-container');
    const starRatingContainer = document.getElementById('star-rating');
    const totalStars = 5;
    let currentRating = 3;

    // --- Navigation Logic with Animation ---
    function navigateTo(screenId) {
        const currentScreenElement = document.getElementById(currentScreen);
        const nextScreenElement = document.getElementById(screenId);

        if (currentScreenElement && nextScreenElement) {
            currentScreenElement.classList.remove('active');
            nextScreenElement.classList.add('active');
            nextScreenElement.style.animation = 'fadeIn 0.3s ease-in-out'; // Add fade-in animation
            currentScreen = screenId;
            appContainer.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
        }
    }

    // --- Star Rating Logic with Hover Animation ---
    function renderStars(rating) {
        if (!starRatingContainer) return;

        starRatingContainer.innerHTML = '';
        for (let i = 1; i <= totalStars; i++) {
            const star = document.createElement('span');
            star.innerHTML = `
                <svg class="star-svg w-10 h-10 transition-all duration-200" fill="${i <= rating ? '#3b82f6' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            `;
            star.addEventListener('click', () => {
                currentRating = i;
                renderStars(currentRating);
            });
            star.addEventListener('mouseover', () => {
                const allStars = starRatingContainer.querySelectorAll('svg');
                allStars.forEach((s, index) => {
                    s.style.transform = index < i ? 'scale(1.2)' : 'scale(1)'; // Slightly larger scale
                    s.setAttribute('fill', index < i ? '#3b82f6' : 'none');
                });
            });
            star.addEventListener('mouseout', () => {
                renderStars(currentRating);
            });
            starRatingContainer.appendChild(star);
        }
    }

    // --- Gemini API Integration with Loading Animation ---
    async function generateFeedbackSummary() {
        const commentTextarea = document.getElementById('feedback-comment');
        const summaryContainer = document.getElementById('summary-container');
        const summaryLoader = document.getElementById('summary-loader');
        const summaryText = document.getElementById('feedback-summary');
        const generateBtn = document.getElementById('generate-summary-btn');

        const apiKey = "YOUR_API_KEY_HERE";

        if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
            summaryContainer.classList.remove('hidden');
            summaryText.textContent = "To use this feature, please add your Gemini API key to the js/script.js file.";
            console.warn("Gemini API key is missing.");
            return;
        }

        const userComment = commentTextarea.value;

        if (!userComment.trim()) {
            summaryText.textContent = "Please write a comment first to generate a summary.";
            summaryContainer.classList.remove('hidden');
            return;
        }

        summaryContainer.classList.remove('hidden');
        summaryLoader.classList.remove('hidden');
        summaryText.textContent = '';
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Simulate loading animation
        summaryText.textContent = "Generating summary..."; // Initial loading message
        let dots = 0;
        const loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            summaryText.textContent = "Generating summary" + ".".repeat(dots);
        }, 500);

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = "You are a helpful assistant for a vehicle rental app. Your task is to summarize the user's feedback comment into a concise, single paragraph. The summary should be polite and capture the main points of the user's experience.";

        const payload = {
            contents: [{
                parts: [{
                    text: `Summarize the following feedback: "${userComment}"`
                }]
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                summaryText.textContent = candidate.content.parts[0].text;
            } else {
                throw new Error("No summary was generated. The response might be empty or blocked.");
            }
        } catch (error) {
            console.error('Gemini API call failed:', error);
            summaryText.textContent = "Sorry, we couldn't generate a summary at this time. Please check your API key and network connection.";
        } finally {
            clearInterval(loadingInterval); // Clear the loading animation
            summaryLoader.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // --- Event Listener Setup using Event Delegation ---
    appContainer.addEventListener('click', (event) => {
        const navButton = event.target.closest('[data-navigate-to]');
        if (navButton) {
            const screenId = navButton.getAttribute('data-navigate-to');
            navigateTo(screenId);
        }

        const summaryButton = event.target.closest('#generate-summary-btn');
        if (summaryButton) {
            generateFeedbackSummary();
        }
    });

    // --- Initializations ---
    renderStars(currentRating);

    // --- Fullscreen Logic with Text Animation ---
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            animateButtonText(fullscreenBtn, 'Full Screen');
        } else {
            document.documentElement.requestFullscreen();
            animateButtonText(fullscreenBtn, 'Exit Full Screen');
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            animateButtonText(fullscreenBtn, 'Exit Full Screen');
        } else {
            animateButtonText(fullscreenBtn, 'Full Screen');
        }
    });

    // --- Helper Functions ---
    function animateButtonText(button, newText) {
        button.classList.add('animate-text-change');
        setTimeout(() => {
            button.textContent = newText;
            button.classList.remove('animate-text-change');
        }, 300);
    }
});
