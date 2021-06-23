const { argv } = require("yargs")
  .scriptName("main.js")
  .usage("Usage: $0 -i imageURL")
  .example(
    "$0 -i 'https://myImage.png'",
    "Use nsfwJs to test the image at imageURL"
  )
  .option("i", {
    alias: "image",
    describe: "Image location as a URL",
    demandOption: "An imageURL is required",
    type: "string",
  });

const axios = require('axios');
const nsfw = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');

let model: any;

//  predict if image is nsfw
async function predictNsfw(imageURL: string): Promise<boolean> {

    // if the model was not loaded
    if ( !model || !imageURL ) {
        return false;
    }

    // get the image
    let pic;
    try {
        pic = await axios.get(imageURL, {
            responseType: 'arraybuffer',
        });
    } catch (err) {
        console.log('Error getting image');
        return false;
    }

    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    let predictions;
    let image;
    try {
        image = await tf.node.decodeImage(pic.data,3);
        predictions = await model.classify(image);
    } catch (err) {
        console.log('Error classifying image');
        return false;
    }

    // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    image.dispose(); 
    
    // check if porn or hentai
    return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
    
}

const { image } = argv;

nsfw.load(`file://${__dirname}/nsfwModel/`).then((m: any) => {
    console.log('Nsfwjs Model Loaded');
    model = m;
    return predictNsfw(image).then( (result: boolean) => {
        console.log('Image nsfw result: ', result)
        return result;
    }, (err: any) => {
        console.log('Error predicting image', err)
    });
}, (err: any) => {
    console.log('Error loading tensorflow model')
});
