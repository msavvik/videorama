import { SampleBuffer, SampleDimension } from "../../../sample-buffer";
import * as ort from "onnxruntime-web/all";

export class Infer {
  /**
   * @private
   * @param {string} tag
   * @param {string} modelUrl
   * @param {{url: string}[]} [dataUrls]
   * @returns {Promise<[model: Response, data: Response[]]>}
   */
  static async fetchResources(tag, modelUrl, dataUrls = []) {
    // Note: Model URL is a last entry in an array of URLs to be fetched to allow 'pop()' removal.
    const resourceUrls = dataUrls.map((data) => data.url).concat(modelUrl);
    console.debug(tag, Infer.fetchResources.name, resourceUrls);

    const resourceResponse = await Promise.all(resourceUrls.map((url) => fetch(new URL(url, import.meta.url))));
    for (const response of resourceResponse) {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} ${response.url}`);
    }

    const modelResponse = /** @type {Response} */ (resourceResponse.pop());
    // resourceResponse no longer contains model response. Data responses only, if any.
    return [modelResponse, resourceResponse];
  }

  /**
   * @private
   * @param {string} tag
   * @param {Response[]} fetchResponse
   * @param {ModelDataInfo[]} [modelData]
   * @returns {Promise<ort.ExternalDataFileDescription[]>}
   */
  static async createDataFileDescription(tag, fetchResponse, modelData = []) {
    console.debug(tag, Infer.createDataFileDescription.name, modelData);

    const responseData = await Promise.all(fetchResponse.map((response) => response.arrayBuffer()));
    return modelData.map(
      (model, index) => /** @type {ort.ExternalDataFileDescription} */ ({ path: model.path, data: responseData[index] })
    );
  }

  /**
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   * @param {string} [tag]
   */
  static async create(model, inference, tag) {
    const tagName = tag?.concat(" ", Infer.name) ?? Infer.name;
    console.debug(tagName, Infer.create.name);

    if (model.input.dimension == undefined) throw new Error(`missing input dimension (tensor) ${model.input}`);

    const [modelRes, dataRes] = await Infer.fetchResources(tagName, model.url, model.modelData);
    /** @type {ort.InferenceSession.SessionOptions} */
    const inferenceOptions = {
      ...inference.sessionInit,
      ...model.sessionInit,
      externalData: await Infer.createDataFileDescription(tagName, dataRes, model.modelData)
    };
    console.debug(tagName, Infer.create.name, inferenceOptions);

    const modelData = await modelRes.arrayBuffer();
    const session = await ort.InferenceSession.create(modelData, inferenceOptions);

    let modelMeta = /** @type {ort.InferenceSession.TensorValueMetadata} */ (session.inputMetadata[0]);
    if (modelMeta.type && modelMeta.type != model.input.type)
      throw new Error(`input metadata[0] type mismatch. model: ${modelMeta.type} input: ${model.input.type}`);

    modelMeta = /** @type {ort.InferenceSession.TensorValueMetadata} */ (session.outputMetadata[0]);
    if (modelMeta.type && modelMeta.type != model.output.type)
      throw new Error(`output metadata[0] type mismatch. model: ${modelMeta.type} output: ${model.output.type}`);

    return new Infer(session, model, tagName);
  }

  /**
   * @private
   * @param {ort.InferenceSession} session
   * @param {ModelInfo} model
   * @param {string} tag
   */
  constructor(session, model, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.session = session;
    /** @private  */
    this.inputTensorType = SampleBuffer.dataType(model.input);
    /** @private */
    this.inputTensorDims = SampleDimension.fromSample(model.input);
  }

  /**
   * @param {ArrayBuffer} sample
   */
  async process(sample) {
    const inputTensor = new ort.Tensor(
      /** @type {ort.Tensor.DataType} */ (new this.inputTensorType(sample)),
      this.inputTensorDims
    );
    const inference = await this.session.run({ [this.session.inputNames[0]]: inputTensor });
    const outputTensor = inference[this.session.outputNames[0]];
    const res = await outputTensor.getData(true);

    inputTensor.dispose();
    outputTensor.dispose();

    return res;
  }

  async dispose() {
    console.debug(this.tag, this.dispose.name);

    await this.session.release();
    this.session = undefined;
    this.inputTensorDims = undefined;
    this.inputTensorType = undefined;
  }
}
