let isSpinning = false
let animationState = {
    episodes: [], // Current episodes in the reel
    position: 0,  // Current scroll position
    targetEpisode: null // Episode we're spinning towards
};

function getRandomEpisode() {
    return episodes[Math.floor(Math.random() * episodes.length)];
}

function createInitialReel() {
    const reel = document.getElementById('slotReel');
    reel.innerHTML = '';

    // Only create enough episodes to fill the visible area plus buffer
    // With 200px height and some buffer, we need about 6-8 episodes visible at once
    const visibleCount = 8;
    animationState.episodes = [];

    // Fill with random episodes initially
    for (let i = 0; i < visibleCount; i++) {
        animationState.episodes.push(getRandomEpisode());
    }

    // Create the DOM elements
    updateReelDisplay();
}

function updateReelDisplay() {
    const reel = document.getElementById('slotReel');
    reel.innerHTML = '';

    // Create DOM elements for current episodes in memory
    animationState.episodes.forEach((episode, index) => {
        const slotItem = document.createElement('div');
        slotItem.className = 'slot-item';
        slotItem.style.top = `${index * 200}px`; // Position each episode
        slotItem.innerHTML = `
            <div class="slot-season-episode">Season ${episode.season}, Episode ${episode.episode}</div>
            <div class="slot-title">${episode.title}</div>
            <div class="slot-description">${episode.description}</div>
        `;
        reel.appendChild(slotItem);
    });

    // Ensure side lights are present (in case they were removed)
    ensureSideLights();
}

function ensureSideLights() {
    const slotWindow = document.getElementById('slotWindow');

    // Check if lights already exist
    if (!slotWindow.querySelector('.side-lights.left')) {
        // Create left side lights
        const leftLights = document.createElement('div');
        leftLights.className = 'side-lights left';
        for (let i = 0; i < 7; i++) {
            const light = document.createElement('div');
            light.className = 'rainbow-light';
            leftLights.appendChild(light);
        }
        slotWindow.appendChild(leftLights);
    }

    if (!slotWindow.querySelector('.side-lights.right')) {
        // Create right side lights
        const rightLights = document.createElement('div');
        rightLights.className = 'side-lights right';
        for (let i = 0; i < 7; i++) {
            const light = document.createElement('div');
            light.className = 'rainbow-light';
            rightLights.appendChild(light);
        }
        slotWindow.appendChild(rightLights);
    }
}

function updateReelContent(scrollDistance) {
    const itemHeight = 200;
    const itemsPassed = Math.floor(scrollDistance / itemHeight);

    // If we've scrolled past episodes, we need to update our reel
    if (itemsPassed > 0) {
        // Remove episodes that have scrolled past the top
        for (let i = 0; i < itemsPassed && animationState.episodes.length > 4; i++) {
            animationState.episodes.shift(); // Remove from beginning
        }

        // Add new random episodes to the end
        const episodesToAdd = Math.min(itemsPassed, 4); // Don't add too many at once
        for (let i = 0; i < episodesToAdd; i++) {
            animationState.episodes.push(getRandomEpisode());
        }

        // Update the display
        updateReelDisplay();

        // Adjust position to account for removed episodes
        animationState.position -= itemsPassed * itemHeight;

        return itemsPassed * itemHeight; // Return how much we adjusted
    }
    return 0;
}

function spinSlots() {
    if (isSpinning) return;

    isSpinning = true;
    const button = document.getElementById('spinButton');
    const buttonText = document.getElementById('buttonText');
    const slotWindow = document.getElementById('slotWindow');
    const reel = document.getElementById('slotReel');

    // Update UI to show we're spinning
    button.disabled = true;
    button.classList.add('spinning');
    buttonText.textContent = '🎰 SPINNING... 🎰';

    // Reset and create initial reel
    createInitialReel();
    animationState.position = 0;

    // Choose our target episode (what we'll land on)
    animationState.targetEpisode = getRandomEpisode();

    // ANIMATION SETTINGS:
    const itemHeight = 200;
    const spinDuration = 4000; // Increased from 2500ms to 4 seconds for slower spin

    // Calculate how far to spin (this is just for the animation effect)
    // We'll dynamically generate content as we go
    const minDistance = 1500; // Reduced minimum distance for shorter spin
    const maxDistance = 3000; // Reduced maximum distance
    const totalDistance = minDistance + Math.random() * (maxDistance - minDistance);

    // Add visual spinning effect
    slotWindow.classList.add('spinning');

    // DYNAMIC ANIMATION LOOP:
    const startTime = Date.now();

    const animate = () => {
        // Calculate animation progress (0 to 1)
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // EASING: Starts fast, slows down naturally
        const easeOut = 1 - Math.pow(1 - progress, 4);

        // Calculate current scroll position
        const targetPosition = totalDistance * easeOut;
        const scrollDistance = targetPosition - animationState.position;

        // UPDATE CONTENT DYNAMICALLY:
        // Check if we need to add/remove episodes based on scroll distance
        const adjustment = updateReelContent(targetPosition);

        // Update the reel position (negative = scroll up)
        animationState.position = targetPosition - adjustment;
        reel.style.transform = `translateY(-${animationState.position}px)`;

        // Continue animation or finish
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // ANIMATION COMPLETE - Show final result
            finishSpin();
        }
    };

    requestAnimationFrame(animate);
}

function finishSpin() {
    const button = document.getElementById('spinButton');
    const buttonText = document.getElementById('buttonText');
    const slotWindow = document.getElementById('slotWindow');
    const reel = document.getElementById('slotReel');

    // Clear the reel and show just the final result
    reel.innerHTML = `
        <div class="slot-item">
            <div class="slot-season-episode">Season ${animationState.targetEpisode.season}, Episode ${animationState.targetEpisode.episode}</div>
            <div class="slot-title">${animationState.targetEpisode.title}</div>
            <div class="slot-description">${animationState.targetEpisode.description}</div>
        </div>
    `;

    // Reset transform
    reel.style.transform = 'translateY(0)';

    // Ensure lights are still there after clearing content
    ensureSideLights();

    // Add win effect
    slotWindow.classList.remove('spinning');
    slotWindow.classList.add('result-glow');

    // Reset button state
    setTimeout(() => {
        button.disabled = false;
        button.classList.remove('spinning');
        buttonText.textContent = '🎰 SPIN AGAIN 🎰';
        isSpinning = false;

        // Remove glow effect
        setTimeout(() => {
            slotWindow.classList.remove('result-glow');
        }, 1000);
    }, 500);
}

// Initialize with welcome message and ensure lights are present
document.addEventListener('DOMContentLoaded', function() {
    const reel = document.getElementById('slotReel');
    reel.innerHTML = `
        <div class="slot-item">
            <div class="slot-season-episode">🎰 Welcome to Bob's Slots! 🎰</div>
            <div class="slot-title">🍔 Ready to Roll? 🍔</div>
            <div class="slot-description">Hit that spin button and let's find your next Bob's Burgers episode!</div>
        </div>
    `;

    // Make sure the rainbow lights are created on page load
    ensureSideLights();
});
