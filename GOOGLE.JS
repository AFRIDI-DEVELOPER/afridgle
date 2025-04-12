document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const luckyButton = document.querySelector('.lucky-button');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const colorOptions = document.querySelectorAll('.color-option');
    let currentFocus = -1;

    // Theme Switcher functionality
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.getAttribute('data-color');
            document.body.style.backgroundColor = color;

            // Save the selected color to localStorage
            localStorage.setItem('selectedColor', color);
        });
    });

    // Load saved color on page load
    const savedColor = localStorage.getItem('selectedColor');
    if (savedColor) {
        document.body.style.backgroundColor = savedColor;
    }

    // Function to perform Google search
    function performSearch(searchTerm = '') {
        const term = searchTerm || searchInput.value.trim();
        if (term) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
        }
    }

    // Function to perform "I'm Feeling Lucky" search
    function feelingLucky() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&btnI=1`;
        }
    }

    // Function to create suggestion elements
    function createSuggestionElement(text) {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<span class="search-icon">🔍</span>${text}`;
        div.addEventListener('click', () => {
            searchInput.value = text;
            performSearch(text);
        });
        return div;
    }

    // Function to show suggestions
    async function showSuggestions(query) {
        if (!query) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        try {
            // Using Google's suggestion API
            const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            suggestionsContainer.innerHTML = '';

            if (data[1] && data[1].length > 0) {
                data[1].forEach(suggestion => {
                    suggestionsContainer.appendChild(createSuggestionElement(suggestion));
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsContainer.style.display = 'none';
        }
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Event listeners
    searchButton.addEventListener('click', () => performSearch());
    luckyButton.addEventListener('click', feelingLucky);

    // Handle input changes for suggestions
    searchInput.addEventListener('input', debounce((e) => {
        showSuggestions(e.target.value);
    }, 300));

    // Handle Enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsContainer.getElementsByClassName('suggestion-item');

        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            currentFocus++;
            addActive(suggestions);
        } else if (e.key === 'ArrowUp') {
            currentFocus--;
            addActive(suggestions);
        } else if (e.key === 'Enter' && currentFocus > -1) {
            e.preventDefault();
            if (suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            }
        }
    });

    function addActive(suggestions) {
        if (!suggestions) return false;

        removeActive(suggestions);

        if (currentFocus >= suggestions.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = suggestions.length - 1;

        suggestions[currentFocus].classList.add('active');
    }

    function removeActive(suggestions) {
        for (let i = 0; i < suggestions.length; i++) {
            suggestions[i].classList.remove('active');
        }
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
});