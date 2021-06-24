const nsfwImagePrediction = require('./main.js');

const data = {
    image: ""
};

nsfwImagePrediction.lambdaHandler(data).then( (response) => {
    console.log(response);
}, (err) => {
    console.log('Error: ', err);
});
