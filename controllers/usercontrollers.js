import { fetchUser, insertUser } from "../models/usermodels.js";
import { checkPassword } from "../utils/hashing.js";

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

export const postUser = async (userParams) => {
    try{
        //Check user exists
        const userCheck = await fetchUser(userParams);
        //If user exists throw error
        if(userCheck[0]?.userName === userParams.name){
            throw new Error("Username already in use");
        } else if(userCheck[0]?.userEmail === userParams.email){
            throw new Error("Email already in use");
        } else {
            //Else post user
            const result = await insertUser(userParams);
            if(result.status === 'success') {
                return result;
            } else {
                throw new Error("Could not create user");
            }
        }
    } catch(err) {
        throw err;
    }
}

export const loginUser = async (userParams) => {
    try {
        //Check user exists
        const user = await fetchUser(userParams);
        if(!user[0]?.userName){
            throw new Error("Invalid credentials");
        }

        const validate = await checkPassword(userParams.password, user[0].userPassword);

        if(!validate){
            throw new Error("Invalid credentials");
        }

        return {
            status: 'success',
            user: {
                userName: user[0].userName,
                userEmail: user[0].userEmail,
                isAdmin: user[0].isAdmin,
                isVerified: user[0].isVerified
            }
        }
    } catch (err) {
        throw err;
    }
}

export const updateUser = async (userName, valueToChange, newValue) => {
    try {
        const result = await updateUser(userName, valueToChange, newValue);
        return result;
    } catch (err) {
        throw err;
    }
}