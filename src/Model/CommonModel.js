export const currentUser = (currentUserData) => {
    let response = currentUserData.data;
    //console.log("currentUser response ===============>", response)
    let currentUserResData = {};
    if (response) {
        if (response.success) {
            currentUserResData = {
                "success": response.success,
                "data": {
                    "id": response.data.id,
                    "user_details": {
                        "first_name": response.data.user_details.first_name,
                        "last_name": response.data.user_details.last_name,
                        "user_email": response.data.user_details.user_email,
                        "active": response.data.user_details.active,
                        "profile_img_url": response.data.user_details.profile_img_url,
                        "role_id": response.data.user_details.role_id,
                        "role_name": response.data.user_details.role_name.toLowerCase(),
                        "user_type": response.data.user_details.user_type,
                        "contact_number": response.data.user_details.contact_number,
                        "role_permission": response.data.user_details.role_permission,
                        "hotel_id": response.data.user_details.hotel_id,
                        "hotel_name": response.data.user_details.hotel_name,
                        "is_subscribed": response.data.user_details.is_subscribed,
                        "version": response.data.user_details.version,
                        "is_beneficiary_included": response.data.user_details.is_beneficiary_included,
                        "user_full_hotel_agency_details": response.data.user_details.user_full_hotel_agency_details,
                    }
                }
            }
        } else {
            currentUserResData = {
                "success": response.success,
                "message": response.message
            }
        }
    }
    return currentUserResData;
}