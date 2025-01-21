import {insertEvent, fetchEvents} from '../models/eventmodels.js';

export const postEvent = async () => {
    
}


export const getEvents = async (queryParams) => {
    try {
        let result;

        if(!queryParams){
            result = await fetchEvents();
        } else {
            const searchParams = {...queryParams};
            if(searchParams.paginate){
                searchParams.paginate.toLowerCase() === "true" ? searchParams.paginate = true : searchParams.paginate = false;
            }
            result = await fetchEvents(searchParams);
        }

        return result;

    } catch (error) {
        throw error;
    }
}