import './styles.scss';
import Movies from './Movies';
import { api } from './Config';

// Initialize the Movies API
const movies = new Movies();

// References to DOM elements used later
const resultsContainer = document.getElementById('search-results');
const detailsContainer = document.getElementById('movie-details');
const errorContainer = document.getElementById('error');
const searchButton = document.getElementById('search-button') as HTMLInputElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const loadMoreLink = document.getElementById('load-more-link');
const loadMoreContainer = document.getElementById('load-more-container');
let offset = 0; // Initial offset
let limit = 10; // Number of items to load per page
let searchTimeout; // Search delay timer
const searchCache = {}; // Cache for search results

// Function to display error message to the user
const displayError = (message: string) => {
    errorContainer.innerHTML = `<div>${message}</div>`;
};

// Add an event listener to the search input
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    // Set a new timeout with a 300ms delay
    searchTimeout = setTimeout(async () => {
        const keyword = searchInput.value.trim();
        if (keyword.length < 2) {
            // Disable the search button and display an error message
            searchButton.disabled = true;
            displayError('Please enter at least 2 characters for a valid search.');
        } else if (keyword.length >= 3) {
            // Enable the search button and clear the error message
            searchButton.disabled = false;
            errorContainer.innerHTML = '';
            const newResults = await searchWithCache(keyword);
            displaySearchResults(newResults);
        }
    }, 300);
});

// Add a click event listener to the search button
searchButton.addEventListener('click', async () => {
    const keyword = searchInput.value;
    if (keyword.length < 2) {
        // Display an error message and don't perform the search
        displayError('Please enter at least 2 characters for a valid search.');
        return;
    }
    // Clear previous results and reset the offset
    resultsContainer.innerHTML = '';
    try {
        const newResults = await searchWithCache(keyword);
        displaySearchResults(newResults);
    } catch (error) {
        displayError(error);
    }
});

// Function to perform the search with caching
async function searchWithCache(keyword) {
    const cacheKey = `${keyword}_${offset}_${limit}`;

    // Check if the result is already cached
    if (searchCache[cacheKey]) {
        console.log(`Using cached results for "${keyword}" (offset: ${offset}, limit: ${limit})`);
        return searchCache[cacheKey];
    }

    try {
        const newResults = await movies.search(keyword, offset, limit);
        // Cache the result
        searchCache[cacheKey] = newResults;
        return newResults;
    } catch (error) {
        throw error;
    }
}

// Function to create "Load more" functionality
function createLoadMore() {
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.id = "load-more-container";

    const loadMoreLink = document.createElement('a');
    loadMoreLink.id = "load-more-link";
    loadMoreLink.href = "#";
    loadMoreLink.textContent = "Load more...";

    loadMoreLink.addEventListener('click', async () => {
        offset += limit;
        const keyword = searchInput.value;

        try {
            const newResults = await searchWithCache(keyword);
            displaySearchResults(newResults, true);
        } catch (error) {
            displayError(error);
        }
        loadMoreLink.remove();
        loadMoreContainer.remove();
    });

    loadMoreContainer.addEventListener('click', () => {
        loadMoreLink.click();
    });

    loadMoreContainer.appendChild(loadMoreLink);
    resultsContainer.appendChild(loadMoreContainer);
}

// Function to display search results
const displaySearchResults = (results, append = false) => {
    if (append) {
        results.forEach(async (movie) => {
            const container: HTMLElement = document.createElement('div');
            container.textContent = movie.name;

            container.addEventListener('click', async () => {
                try {
                    const metadata = await movies.fetchMovieMetadata(movie.id);
                    updateDetails(movie, metadata);
                } catch (error) {
                    console.error('Error fetching movie metadata', error);
                    displayError('Error fetching movie metadata');
                }
            });

            resultsContainer.appendChild(container);
        });
    } else {
        resultsContainer.innerHTML = '';
        results.forEach(async (movie) => {
            const container: HTMLElement = document.createElement('div');
            container.textContent = movie.name;

            container.addEventListener('click', async () => {
                try {
                    const metadata = await movies.fetchMovieMetadata(movie.id);
                    updateDetails(movie, metadata);
                } catch (error) {
                    console.error('Error fetching movie metadata', error);
                    displayError('Error fetching movie metadata');
                }
            });

            resultsContainer.appendChild(container);
        });
    }

    if (results.length === limit) {
        createLoadMore();
    } else {
        if (loadMoreContainer) {
            loadMoreContainer.remove();
        }
    }
};

// Function to update movie details
const updateDetails = async (movie, metadata) => {
    const imageSrc = `${api.imageBaseUrl}${movie.images['webPosterLarge']}`;

    const titleElement = document.createElement('div');
    titleElement.textContent = `Title: ${getTitleForDisplay(metadata.title, metadata.originalTitle) || 'No info'}`;

    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = `Description: ${movie.description || 'No info'}`;

    const uniqueWordsCount = countUniqueWords(movie.description);
    const uniqueWordsElement = document.createElement('div');
    uniqueWordsElement.textContent = `Unique Words Count: ${uniqueWordsCount}`;

    const imdbRatingElement = document.createElement('div');
    imdbRatingElement.textContent = `IMDB Rating: ${metadata.imdbRating || 'No info'}`;

    const posterElement = document.createElement('img');
    posterElement.src = imageSrc;

    detailsContainer.innerHTML = '';

    detailsContainer.appendChild(titleElement);
    detailsContainer.appendChild(descriptionElement);
    detailsContainer.appendChild(uniqueWordsElement);
    detailsContainer.appendChild(imdbRatingElement);
    detailsContainer.appendChild(posterElement);
};

function getTitleForDisplay(title, originalTitle) {
    console.log(title,"-",originalTitle)
    if (title === originalTitle || originalTitle === null) {
        return title;
    } else {
        return `${title} (${originalTitle})`;
    }
}

// Function to count the number of unique words in the plot text
function countUniqueWords(text) {
    // Convert the text to lowercase to make it case-insensitive
    const lowercaseText = text.toLowerCase();

    // Split the text into words
    const words = lowercaseText.split(/\s+/);

    // Use a Set to store unique words
    const uniqueWords = new Set(words);

    // Return the count of unique words
    return uniqueWords.size;
}
