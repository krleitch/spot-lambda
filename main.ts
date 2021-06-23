const { argv } = require("yargs")
  .scriptName("main")
  .usage("Usage: $0 -i imageURL")
  .example(
    "$0 -i http://myImage.png",
    "nsfwJs test the image"
  )
  .option("i", {
    alias: "image",
    describe: "Url to image",
    demandOption: "An image url is required",
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
    const pic = await axios.get(imageURL, {
        responseType: 'arraybuffer',
    });

    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    const image = await tf.node.decodeImage(pic.data,3);
    const predictions = await model.classify(image);
    // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    image.dispose(); 
    
    // check if porn or hentai
    return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
    
}

const { image } = argv;

nsfw.load(`file://${__dirname}/nsfwModel/`).then((m: any) => {
    console.log('Nsfwjs Model Loaded');
    model = m;
    predictNsfw(image).then( (result: boolean) => {
        console.log('Image nsfw result: ', result)
    }, (err: any) => {
        console.log('Error predicting image', err)
    });
}, (err: any) => {
    console.log('Error loading tensorflow model')
});
