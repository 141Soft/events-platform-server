import {insertEvent, fetchEvents, fetchTags} from '../models/eventmodels.js';

export const postEvent = async () => {
    
}


export const getEvents = async (queryParams) => {
    try {
        queryParams?.paginate?.toLowerCase() === "true" ? queryParams.paginate = true : queryParams.paginate = false;
        return await fetchEvents(queryParams);
    } catch (err) {
        throw err;
    }
}

export const getTags = async () => {
    try {
        return await fetchTags();
    } catch(err) {
        throw err
    }
}