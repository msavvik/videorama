/**
 * @typedef {import("onnxruntime-web/all").InferenceSession.SessionOptions} ModelSessionInit
 *
 *
 * @typedef ModelDataInfo
 * @property {string} path Weights’ “location” info in the protobuf file.
 * @property {string} url Weights' url
 *
 *
 * @typedef ModelInfo
 * @property {string} name Model display name.
 * @property {string} [info] Description information
 * @property {string} url Model url.
 * @property {ModelDataInfo[]} [modelData] Model data information.
 * @property {{width: number, height: number}} [scalingStep]
 * Integer width/height values representing scaling steps. Presents indicates dynamic sized model input.
 * 
 * Expressed as:
 * 
 * width = scalingStep.width * floor( source.width / scalingStep.width )
 * height = scalingStep.height * floor( source.height / scalingStep.height )
 * @property {SampleLayout} input Model input sample.
 * @property {SampleLayout} output Model output sample.
 * @property {boolean} [invertOutput]
 * @property {ModelSessionInit} [sessionInit] Model specific inference session initialisation options.
 *
 *
 * @typedef InferenceInfo
 * @property {string} name Inference provider display name.
 * @property {ModelSessionInit} sessionInit Inference provider session initialisation options.
 *
 * @typedef NodeInferInput
 * @property {number} sample
 *
 * @typedef NodeInferOutput
 * @property {number} sample
 *
 * @typedef NodeInferOptions
 * @property {NodeInferInput} input
 * @property {NodeInferOutput} output
 * @property {ModelInfo} model
 * @property {InferenceInfo} inference
 * @property {string} [tag]
 * @property {QueuingStrategy<any[]>} [writableStrategy]
 * @property {QueuingStrategy<any[]>} [readableStrategy]
 */
