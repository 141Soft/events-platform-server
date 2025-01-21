import {insertEvent, fetchEvents} from '../models/eventmodels.js';

export const postEvent = async () => {

}


//This will eventually take search params
export const getEvents = async (queryParams) => {

    const searchParams = {...queryParams};
    searchParams.paginate.toLowerCase() === "true" ? searchParams.paginate = true : searchParams.paginate = false;

    try {
        const result = await fetchEvents(searchParams);
        return result;
        
    } catch (error) {
        throw error;
    }
}