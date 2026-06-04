// rounding factor to 1 decimal places.
const roundFactor = 10;

/**
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
function aspectRatio(width, height) {
  return (((width / height) * roundFactor) >> 0) / roundFactor;
}

/**
 * @param {AppModel} appModel
 * @param {MediaInfo} media
 * @returns {ModelInfo}
 */
export function arMatchModel(appModel, media) {
  const mediaAr = aspectRatio(media.width, media.height);
  console.log(arMatchModel.name, mediaAr);

  let defaultResource = appModel.modelResource[0];
  for (const resource of appModel.modelResource) {
    if (resource.scalingStep) return resource;

    const resourceAr = aspectRatio(resource.input.width, resource.input.height);

    if (resourceAr == mediaAr) {
      console.debug(arMatchModel.name, "matching", resource);
      return resource;
    }

    if (resourceAr == 1) defaultResource = resource;
  }

  console.debug(arMatchModel.name, "default", defaultResource);
  return defaultResource;
}

/**
 * @param {{width: number, height: number}} size
 * @param {number} scaleCoeff
 */
function scaleSize(size, scaleCoeff) {
  return {
    width: size.width * scaleCoeff,
    height: size.height * scaleCoeff
  };
}

/**
 * @param {{width: number, height: number}} sourceSize
 * @param {number} scaleCoeff
 * @param {{width: number, height: number}} stepSize
 */
export function stepScale(sourceSize, scaleCoeff, stepSize) {
  const coeffScaled = scaleSize(sourceSize, scaleCoeff);
  return {
    width: stepSize.width * Math.floor(coeffScaled.width / stepSize.width),
    height: stepSize.height * Math.floor(coeffScaled.height / stepSize.height)
  };
}
