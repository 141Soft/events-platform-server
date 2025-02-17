import {insertEvent, fetchEvents, fetchTags, updateEventParticipants, insertTags} from '../models/eventmodels.js';

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

export const addEventParticipant = async (eventName, userEmail) => {
    try {
        const event = await getEvents({name:eventName});
        const eventID = event.events[0].id;
        return await updateEventParticipants(eventID, userEmail);
    } catch(err) {
        throw err
    }
}