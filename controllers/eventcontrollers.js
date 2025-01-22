import {insertEvent, fetchEvents} from '../models/eventmodels.js';

export const postEvent = async () => {
    
}


export const getEvents = async (queryParams) => {
    try {
        if(queryParams?.paginate){
            queryParams.paginate.toLowerCase() === "true" ? queryParams.paginate = true : queryParams.paginate = false;
            return await fetchEvents(queryParams);
        } else {
            return await fetchEvents();
        }
    } catch (error) {
        throw error;
    }
}