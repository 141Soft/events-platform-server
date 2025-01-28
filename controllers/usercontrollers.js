import { fetchUser } from "../models/usermodels.js";

export const getUser = async (userParams) => {
    try {
        if(!userParams?.name && !userParams?.email){
            throw new Error("Params Required")
        };

        const result = await fetchUser(userParams);

        // If you get multiple entries in the result array here check the db integrity
        // could be an issue with name/email checking on account creation

        if(!result[0]?.userName || !result[0]?.userEmail){
            throw new Error("No User Found");
        };

        const {userName, userEmail} = result[0];

        return {
            user: {
                userName,
                userEmail
            }
        };
    } catch(err) {
        throw(err)
    }
}