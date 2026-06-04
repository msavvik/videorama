import inferenceConfig from "../../public/config/inference.json";
import kinematoscopeConfig from "../../public/config/kinematoscope.json";
import scalingConfig from "../../public/config/input_scaling.json";
import { fetchResources, arMatchModel, stepScale } from "../lib/app-config";
import { Selector } from "../ui/selector";
import { StreamPipeline } from "../lib/pipeline/index";
import { KinematoscopePipeline } from "./pipeline";
import { MediaProbe } from "../lib/media-probe";
import { Spinner } from "../ui/spinner";
import { UrlSource } from "../ui/url-source";

/**
 * @typedef Scaling
 * @property {string} name
 * @property {number} value
 *
 * @typedef Renderer
 * @property {string} name
 * @property {RenderPipeline} id
 *
 * @typedef StreamChunkUnit
 * @property {number} source
 * @property {number} sourceScaled
 * @property {number} sample
 * @property {number} inference
 * @property {number} depthMap
 * @property {number} dibFrame
 */

/** @type {[AppModel[], MediaInfo[]]} */
const [resourceModel, resourceMedia] = await Promise.all([
  fetchResources(kinematoscopeConfig.modelSource),
  fetchResources(kinematoscopeConfig.mediaSource)
]);

const rendererSource = kinematoscopeConfig.renderer;

const mediaSelector = new Selector("options-container", "media", resourceMedia, " media: ", onMediaChange);
const modelSelector = new Selector("options-container", "model", resourceModel, " fairy: ", onModelChange);
const scalingSelector = new Selector("options-container", "scaling", /** @type {Scaling[]} */ (scalingConfig), " scaling: ");
scalingSelector.visible(false);
const inferenceSelector = new Selector(
  "options-container",
  "provider",
  /** @type {InferenceInfo[]} */ (inferenceConfig),
  " dust: "
);
const rendererSelector = new Selector("options-container", "effect", rendererSource, " magic: ");
const urlSource = new UrlSource({
  parentId: "url-source-container",
  fieldProps: { onchange: mediaSelector.clearSelection },
  choiceProps: { onchange: mediaSelector.clearSelection }
});

/** @param {AppModel} appModel  */
function onModelChange(appModel) {
  const hideScaling = appModel.modelResource[0].scalingStep == undefined;
  scalingSelector.visible(!hideScaling);
}

/**
 * @param {MediaInfo} selection
 */
function onMediaChange(selection) {
  urlSource.url = selection.url;
}

const promiseStartStop = Promise.resolve();
/** @type {Promise<void>} */
let stream;
/** @type {VideoFrameSource} */
let frameSource;

async function setupStreamPipeline() {
  console.debug(setupStreamPipeline.name);

  const mediaChoice = mediaSelector.selection();
  const modelChoice = modelSelector.selection();
  const inferenceChoice = inferenceSelector.selection();
  const rendererChoice = /** @type {Renderer} */ (rendererSelector.selection());

  if (!mediaChoice || !modelChoice || !inferenceChoice || !rendererChoice) {
    throw new Error(
      `missing selection. media: ${mediaChoice} model: ${modelChoice} provider: ${inferenceChoice} effect: ${rendererChoice}`
    );
  }

  Object.assign(mediaChoice, await MediaProbe.probe(mediaChoice.url));

  // @ts-ignore
  document.getElementById("media-info").innerText = `res=${mediaChoice.width}x${mediaChoice.height}`;

  const model = arMatchModel(modelChoice, mediaChoice);

  const inferenceInfo = [];
  if (model.scalingStep) {
    inferenceInfo.push(`scale_step=${model.scalingStep.width}x${model.scalingStep.height}`);

    const scalingChoice = scalingSelector.selection();
    if (!scalingChoice) {
      throw new Error(`${setupStreamPipeline.name} missing scaling selection.`);
    }

    const sizeScaled = stepScale(mediaChoice, scalingChoice.value, model.scalingStep);
    Object.assign(model.input, sizeScaled);
    Object.assign(model.output, sizeScaled);
  }

  inferenceInfo.push(`res=${model.input.width}x${model.input.height}`);
  // @ts-ignore
  document.getElementById("inference-info").innerText = inferenceInfo.join(" ");

  let nodes;
  [frameSource, nodes] = await KinematoscopePipeline.create(mediaChoice, model, inferenceChoice, rendererChoice.id);
  stream = StreamPipeline.link(...nodes);
}

async function dismantleStreamPipeline() {
  console.debug(dismantleStreamPipeline.name);

  await frameSource.dispose();
  await stream;

  /** @type {(VideoFrameSource | undefined)} */ (frameSource) = undefined;
  /** @type {(Promise<void> | undefined)} */ (stream) = undefined;
}

/**
 * @param {PointerEvent} ev
 */
function onStart(ev) {
  console.debug(onStart.name);

  /** @type {HTMLButtonElement} */ (ev.target).disabled = true;

  promiseStartStop
    .then(async () => {
      Spinner.setLabel("summoning fairies");

      return await setupStreamPipeline();
    })
    .then(async () => {
      return await frameSource.play();
    })
    .then(() => {
      /** @type {HTMLButtonElement} */ (document.getElementById("stop")).disabled = false;
    })
    .finally(() => {
      console.debug(onStart.name, "end");

      Spinner.clearLabel("summoning fairies");
    });
}

/**
 * @param {PointerEvent} ev
 */
function onStop(ev) {
  console.debug(onStop.name);

  /** @type {HTMLButtonElement} */ (ev.target).disabled = true;

  promiseStartStop
    .then(() => {
      console.debug(onStop.name, "begin");

      Spinner.setLabel("casting out fairies");

      return dismantleStreamPipeline();
    })
    .then(() => {
      document.getElementById("media-info").innerText = "";
      document.getElementById("inference-info").innerText = "";
      /** @type {HTMLButtonElement} */ (document.getElementById("start")).disabled = false;
    })
    .finally(() => {
      console.debug(onStop.name, "end");

      stream = undefined;
      frameSource = undefined;

      Spinner.clearLabel("casting out fairies");
    });
}

document.getElementById("start").onclick = onStart;
document.getElementById("stop").onclick = onStop;
