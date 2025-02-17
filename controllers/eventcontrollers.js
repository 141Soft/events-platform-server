import {insertEvent, fetchEvents, fetchTags, updateEventParticipants, insertTags, fetchUserEvents} from '../models/eventmodels.js';

export const postEvent = async (event, path) => {
    try {
        const eventID = await insertEvent(event, path);
        const result = await insertTags(eventID, event.eventTags);
        return result;
    } catch(err) {
        throw err;
    };
}


export const getEvents = async (queryParams) => {
    try {
        queryParams?.paginate?.toLowerCase() === "true" ? queryParams.paginate = true : queryParams.paginate = false;
        const result = await fetchEvents(queryParams);
        return result;
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

export const addEventParticipant = async (eventID, userEmail) => {
    try {
        const event = await getEvents({id:eventID});
        if(event.events[0]){
            const result = await updateEventParticipants(eventID, userEmail);
            return result;
        };
    } catch(err) {
        throw err;
    };
};

export const getUserEvents = async (userEmail) => {
    try {
        const result = await fetchUserEvents(userEmail);
        return result;
    } catch(err) {
        throw err;
    };
};