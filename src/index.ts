import './styles.scss';
import Movies from './Movies';
import { api } from './Config';

// Initialises Movies API
const movies: Movies = new Movies();

// Remember references to the DOM elements used later
const resultsContainer = document.getElementById('search-results');
const detailsContainer = document.getElementById('movie-details');
const errorContainer = document.getElementById('error');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const loadMoreLink = document.getElementById('load-more-link');

let offset = 0; // Initial offset
let limit = 15; // Number of items to load per page
const searchCache = {}; 
// Display error message to user
const displayError = (message: string) => {
    errorContainer.innerHTML = `<div>${message}</div>`;
};

searchButton.addEventListener('click', async () => {
    const keyword = searchInput.value;

    // Clear previous results and reset offset
    resultsContainer.innerHTML = '';
    offset = 0;

    try {
        const newResults = await searchWithCache(keyword);
        displaySearchResults(newResults);

        // Show or hide "load more results" link based on the number of results
        if (newResults.length < limit) {
            loadMoreLink.style.display = 'none';
        } else {
            loadMoreLink.style.display = 'block';
        }
    } catch (error) {
        displayError(error);
    }
});

loadMoreLink.addEventListener('click', async () => {
    offset += limit;
    const keyword = searchInput.value;

    try {
        const newResults = await searchWithCache(keyword);
        displaySearchResults(newResults, true); // Установите append в true здесь
    } catch (error) {
        displayError(error);
    }
});

async function searchWithCache(keyword) {
    const cacheKey = `${keyword}_${offset}_${limit}`;

    // Check if the result is already cached
    if (searchCache[cacheKey]) {
        console.log(`Using cached results for "${keyword}" (offset: ${offset}, limit: ${limit})`);
        return searchCache[cacheKey];
    }

    try {
        const newResults = await movies.search(keyword, offset, limit);
        searchCache[cacheKey] = newResults; // Cache the result
        return newResults;
    } catch (error) {
        throw error;
    }
}

// Load detailed information about a movie
const updateDetails = async (movie, metadata) => {
    const imageSrc = `${api.imageBaseUrl}${movie.images['webPosterLarge']}`;

    const titleElement = document.createElement('div');
    titleElement.textContent = `Title: ${metadata.title || 'No info'}  ${metadata.originalTitle || ''}`;

    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = `Description: ${movie.description || 'No info'}`;

    const imdbRatingElement = document.createElement('div');
    imdbRatingElement.textContent = `IMDB Rating: ${metadata.imdbRating || 'No info'} `;

    const posterElement = document.createElement('img');
    posterElement.src = imageSrc;

    // Очищаем предыдущие данные, если они были отображены
    detailsContainer.innerHTML = '';

    // Добавляем новые элементы на веб-страницу
    detailsContainer.appendChild(titleElement);
    detailsContainer.appendChild(descriptionElement);
    detailsContainer.appendChild(imdbRatingElement);
    detailsContainer.appendChild(posterElement);
};

const displaySearchResults = (results, append = false) => {
    // Если append установлен в true, добавляем новые результаты к существующим
    if (append) {
        results.forEach((movie) => {
            const container: HTMLElement = document.createElement('div');
            container.innerHTML = movie.name;
            container.addEventListener('click', updateDetails.bind(this, movie));

            resultsContainer.appendChild(container);
        });
    } else {
        // В противном случае очищаем предыдущие результаты и отображаем только новые
        resultsContainer.innerHTML = '';
        results.forEach((movie) => {
            const container: HTMLElement = document.createElement('div');
            container.innerHTML = movie.name;
            container.addEventListener('click', updateDetails.bind(this, movie));

            resultsContainer.appendChild(container);
        });
    }

    // Устанавливаем видимость "load more results" в зависимости от количества результатов
    if (results.length < limit) {
        loadMoreLink.style.display = 'none';
    } else {
        loadMoreLink.style.display = 'block';
    }
};


/*
const updateSearchResults = async (keyword: string) => {
    resultsContainer.innerHTML = '';
    if (searchCache[keyword]) {
        console.log(`Using cached results for "${keyword}"`);
        displaySearchResults(searchCache[keyword]);
        return;
    }

    let results = [];

    try {
        results = await movies.search(keyword);
    } catch (error) {
        displayError(error);
    }

    // Отображаем результаты поиска по одному
    results.forEach((movie) => {
        const container: HTMLElement = document.createElement('div');
        container.textContent = movie.name;

        // Добавляем обработчик клика для отображения дополнительной информации о фильме
        container.addEventListener('click', async () => {
            try {
                // Запрашиваем дополнительные метаданные о фильме
                const metadata = await movies.fetchMovieMetadata(movie.id);
                //console.log(metadata)
                // Отображаем полученные метаданные
                updateDetails(movie, metadata);
            } catch (error) {
                // Обработка ошибок при запросе метаданных
                console.error('Ошибка при получении метаданных фильма', error);
                displayError('Ошибка при получении метаданных фильма');
            }
        });

        resultsContainer.appendChild(container);
    });
    if (results.length < limit) {
        loadMoreLink.style.display = 'none';
    }
    searchCache[keyword] = results;
};*/