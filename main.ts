const axios = require('axios');
const nsfw = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');

//  predict if image is nsfw
async function predictNsfw(model: any, imageURL: string): Promise<Object> {

    // if the model was not loaded
    if ( !model || !imageURL ) {
        return {};
    }

    // get the image
    let pic;
    try {
        pic = await axios.get(imageURL, {
            responseType: 'arraybuffer',
        });
    } catch (err) {
        return {};
    }

    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    let predictions;
    let image;
    try {
        image = await tf.node.decodeImage(pic.data,3);
        predictions = await model.classify(image);
    } catch (err) {
        return {};
    }

    // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    image.dispose(); 
    
    // check if porn or hentai
    // return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
    return predictions[0];
    
}

// S3 Bucket
const MODEL_URL = `https://nsfw-image-model.s3.amazonaws.com/nsfwModel/`;
// Local Model
// const MODEL_URL = `file://${__dirname}/nsfwModel/`

exports.lambdaHandler = async (event: any) => {

    if ( !event.image ) {
        return {
            message: 'image is required',
            statusCode: 500
        }
    }

    const imageURL = event.image;
    let predictions;
    let model;

    try {
        model = await nsfw.load(MODEL_URL);
        predictions = await predictNsfw(model, imageURL);
    } catch (err) {
        return {
            message: err.toString(),
            statusCode: 500
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(predictions)
    }

}
