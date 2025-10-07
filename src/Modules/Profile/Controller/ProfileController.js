import { get, post, put, del, patch } from '../../../Utility/Http';
import { verifyMFAPost, associateSoftwareTokenPut, verifySoftwareTokenPut, usrMfaAssignPut } from '../Model/ProfileModel';
import Config from '../../../Utility/Config';
export const verifyMFA = async (data, header) => {
    const response = await get(`${Config.extendedUrl}users/mfa/verify`, data, header);
    return verifyMFAPost(response);
};

export const associateSoftwareToken = async (headers) => {
    const response = await put(`${Config.extendedUrl}users/associate_software_token`, null, headers);
    return associateSoftwareTokenPut(response);
};
export const verifySoftwareToken = async (data, header) => {
    const response = await put(`${Config.extendedUrl}users/verify_software_token`, data, header);
    return verifySoftwareTokenPut(response);
};
export const usrMfaAssign = async (data, header) => {
    const response = await put(`${Config.extendedUrl}users/usr_mfa_assign`, data, header);
    return usrMfaAssignPut(response);
};
