import {insertEvent, fetchEvents} from '../models/eventmodels.js';

export const postEvent = async () => {
    
}


export const getEvents = async (queryParams) => {
    try {
        queryParams?.paginate?.toLowerCase() === "true" ? queryParams.paginate = true : queryParams.paginate = false;
        return await fetchEvents(queryParams);
    } catch (error) {
        throw error;
    }
}