import './styles.scss';
import Movies from './Movies';
import { api } from './Config';

// Initialises Movies API
const movies: Movies = new Movies();

// Remember references to the DOM elements used later
const resultsContainer = document.getElementById('search-results');
const detailsContainer = document.getElementById('movie-details');
const errorContainer = document.getElementById('error');

// Add listener to search button
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
searchButton.addEventListener('click', () => {
    updateSearchResults((searchInput as HTMLInputElement).value);
});

// Display error message to user
const displayError = (message: string) => {
    errorContainer.innerHTML = `<div>${message}</div>`;
};

// Load new search results and update the listing
const updateSearchResults = async (keyword: string) => {
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
                console.log(metadata)
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
};
// Load detailed information about a movie
const updateDetails = async (movie, metadata) => {
    //console.log(movie)
    const imageSrc = `${api.imageBaseUrl}${movie.images['webPosterLarge']}`;

    const titleElement = document.createElement('div');
    titleElement.textContent = `Title: ${metadata.title || 'No info'}  ${metadata.originalTitle || ''}`;

    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = `Description: ${movie.description || 'Нет информации'}`;

    const imdbRatingElement = document.createElement('div');
    imdbRatingElement.textContent = `IMDB Rating: ${metadata.imdbRating}`;

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