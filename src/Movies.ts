import axios from 'axios';
import { api } from './Config';
import { info } from './Log';

const moviesAjax = axios.create({
    baseURL: api.baseUrl
});

export default class Movies {
    constructor() {
        info('Initialise Movies API.');
    }

    // Search for a movie from API by its title.
    async search(title = '') {
        info(`Search for "${title}" from API.`);

        const params = {
            offset: 0,
            limit: 10,
            // possible values: description,tags,year,duration,ageRating
            fields: ['description', 'year'],
            // possible values: webPosterMedium, webPosterLarge, webBackdropMedium, webBackdropLarge
            images: ['webPosterLarge'],
        };

        const { data } = await moviesAjax.get(`search/${title}`, {
            params,
            
        });
        if (data.Error) {
            throw data.Error;
        }
        console.log(data.items)
        return data.items;
    }
    async fetchMovieMetadata(movieId) {
        try {
            // Создаем URL для запроса метаданных фильма
            const metadataUrl = `${api.baseUrl}assets/${movieId}`;
        
            // Отправляем GET-запрос к API
            const response = await moviesAjax.get(metadataUrl);
        
            // Получаем данные о фильме из ответа
            const movieMetadata = response.data;
            console.log(movieMetadata)
            // Возвращаем необходимые метаданные
            return {
                title: movieMetadata.title,
                originalTitle: movieMetadata.titleOriginal,
                description: movieMetadata.description,
                imdbRating: movieMetadata.imdbRating,
                images: movieMetadata.images
                // Другие поля, которые вас интересуют
            };
        } catch (error) {
            // Обработка ошибок
            console.error('Ошибка при запросе метаданных фильма', error);
            throw error;
        }
    }
}
