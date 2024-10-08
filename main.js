"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var axios = require('axios');
var nsfw = require('nsfwjs');
var tf = require('@tensorflow/tfjs-node');
//  predict if image is nsfw
function predictNsfw(model, imageURL) {
    return __awaiter(this, void 0, void 0, function () {
        var pic, err_1, predictions, image, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // if the model was not loaded
                    if (!model || !imageURL) {
                        return [2 /*return*/, {}];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios.get(imageURL, {
                            responseType: 'arraybuffer',
                        })];
                case 2:
                    pic = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, {}];
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, tf.node.decodeImage(pic.data, 3)];
                case 5:
                    image = _a.sent();
                    return [4 /*yield*/, model.classify(image)];
                case 6:
                    predictions = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    return [2 /*return*/, {}];
                case 8:
                    // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
                    image.dispose();
                    // check if porn or hentai
                    // return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
                    return [2 /*return*/, predictions[0]];
            }
        });
    });
}
// S3 Bucket
var MODEL_URL = "https://nsfw-image-model.s3.amazonaws.com/nsfwModel/";
// Local Model
// const MODEL_URL = `file://${__dirname}/nsfwModel/`
exports.lambdaHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var imageURL, predictions, model, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!event.image) {
                    return [2 /*return*/, {
                            message: 'image is required',
                            statusCode: 500
                        }];
                }
                imageURL = event.image;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, nsfw.load(MODEL_URL)];
            case 2:
                model = _a.sent();
                return [4 /*yield*/, predictNsfw(model, imageURL)];
            case 3:
                predictions = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                return [2 /*return*/, {
                        message: err_3.toString(),
                        statusCode: 500
                    }];
            case 5: return [2 /*return*/, {
                    statusCode: 200,
                    body: JSON.stringify(predictions)
                }];
        }
    });
}); };
