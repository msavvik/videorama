import inferenceConfig from "../../public/config/inference.json";
import upscaleConfig from "../../public/config/upscale.json";
import { fetchResources, arMatchModel } from "../lib/app-config";
import { Selector } from "../ui/selector";
import { UpscalePipeline } from "./pipeline";
import { MediaProbe } from "../lib/media-probe";
import { Spinner } from "../ui/spinner";
import { UrlSource } from "../ui/url-source";
import { StreamPipeline } from "../lib/pipeline";

/** @type {[AppModel[], MediaInfo[]]} */
const [resourceModel, resourceMedia] = await Promise.all([
  fetchResources(upscaleConfig.modelSource),
  fetchResources(upscaleConfig.mediaSource)
]);
const mediaSelector = new Selector("options-container", "media", resourceMedia, " media: ", onMediaChange);
const modelSelector = new Selector("options-container", "model", resourceModel, " fairy: ");
const inferenceSelector = new Selector(
  "options-container",
  "provider",
  /** @type {InferenceInfo[]} */ (inferenceConfig),
  " dust: "
);
const urlSource = new UrlSource({
  parentId: "url-source-container",
  fieldProps: { onchange: mediaSelector.clearSelection },
  choiceProps: { onchange: mediaSelector.clearSelection }
});

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
  const mediaChoice = mediaSelector.selection();
  const modelChoice = modelSelector.selection();
  const inferenceChoice = inferenceSelector.selection();

  if (!mediaChoice || !modelChoice || !inferenceChoice) {
    throw new Error(
      `${setupStreamPipeline.name} missing selection. media: ${mediaChoice} model: ${modelChoice} provider: ${inferenceChoice}`
    );
  }

  Object.assign(mediaChoice, await MediaProbe.probe(mediaChoice.url));

  const model = arMatchModel(modelChoice, mediaChoice);

  let nodes;
  [frameSource, nodes] = await UpscalePipeline.create(mediaChoice, model, inferenceChoice);
  stream = StreamPipeline.link(...nodes);

  await frameSource.play();
}

async function dismantleStreamPipeline() {
  console.debug(dismantleStreamPipeline.name);

  await frameSource.dispose();
  await stream;

  frameSource = undefined;
  stream = undefined;
}

/**
 * @param {any} err
 */
function onError(err) {
  console.error(err);
}

/**
 * @param {PointerEvent} ev
 */
function onStart(ev) {
  console.debug(onStart.name);

  /** @type {HTMLButtonElement} */ (ev.target).disabled = true;

  promiseStartStop
    .then(() => {
      console.debug(onStart.name, "begin");

      Spinner.setLabel("summoning fairies");

      return setupStreamPipeline();
    })
    .then(() => {
      return frameSource.play();
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
      console.debug(onStop.name, frameSource.dispose.name);

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
