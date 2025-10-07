import { get, post, put, del, patch } from '../Utility/Http';
import { currentUser } from '../Model/CommonModel';
import Config from '../Utility/Config';

export const getCurrentUser = async () => {
    const response = await get(`${Config.extendedUrl}currentuser`, null);
    return currentUser(response);
};