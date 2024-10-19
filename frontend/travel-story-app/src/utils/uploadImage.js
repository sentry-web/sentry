import axiosIntance from "./axiosinstance"

const uploadImage = async(imageFile) => {
    const formData = new FormData();
    //append image file to form data
    formData.append('image' ,imageFile)

    try {
        const response = await axiosIntance.post('/upload-image',formData, {
            headers: {
                'Content-Type' :'multipart/form-data',//set header for file upload
            }
        })
        console.log(response.data)
        return response.data //return response data

    }
    catch(error){
        console.log("error uploading the image ")
        throw error //retrow error for handling
    }
}

export default uploadImage