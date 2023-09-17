import axios from 'axios';
import { api } from './Config';
import { info } from './Log';

// Create an Axios instance for movie-related API requests
const moviesAjax = axios.create({
    baseURL: api.baseUrl
});

// Define a Movies class that encapsulates movie-related functionality
export default class Movies {
    constructor() {
        info('Initialize Movies API.');
    }

    // Search for a movie from the API by its title.
    async search(title = '', offset = 0, limit = 10) {
        info(`Search for "${title}" from API.`);

        // Define request parameters, including offset, limit, fields, and images
        const params = {
            offset,
            limit,
            fields: ['description', 'year'],
            images: ['webPosterLarge'],
        };

        try {
            // Send a GET request to search for movies
            const { data } = await moviesAjax.get(`search/${title}`, {
                params,
            });

            // Check for errors in the response data
            if (data.Error) {
                throw data.Error;
            }

            // Log the retrieved movie items
            console.log(data.items);

            // Return the movie items
            return data.items;
        } catch (error) {
            // Handle and log errors that may occur during the search
            console.error('Error searching for movies', error);
            throw error;
        }
    }

    // Fetch metadata for a movie using its ID
    async fetchMovieMetadata(movieId) {
        try {
            // Create the URL for fetching movie metadata
            const metadataUrl = `${api.baseUrl}assets/${movieId}`;

            // Send a GET request to fetch movie metadata
            const response = await moviesAjax.get(metadataUrl);

            // Extract movie metadata from the response data
            const movieMetadata = response.data;

            // Log the retrieved movie metadata
            console.log(movieMetadata);

            // Return the relevant metadata fields
            return {
                title: movieMetadata.title,
                originalTitle: movieMetadata.titleOriginal,
                description: movieMetadata.description,
                imdbRating: movieMetadata.imdbRating,
                // Add other fields of interest here
            };
        } catch (error) {
            // Handle and log errors that may occur during metadata retrieval
            console.error('Error fetching movie metadata', error);
            throw error;
        }
    }
}
