import {insertEvent, fetchEvents} from '../models/eventmodels.js';

export const postEvent = async () => {

}


//This will eventually take search params
export const getEvents = async () => {
    try {
        const result = await fetchEvents();
        return result;
        
    } catch (error) {
        throw error;
    }
}