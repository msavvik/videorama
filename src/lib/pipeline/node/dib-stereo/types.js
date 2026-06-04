/**
 * @typedef NodeDepthImageBasedStereoInput
 * @property {number} frame
 * @property {number} depthSample
 *
 * @typedef NodeDepthImageBasedStereoOutput
 * @property {number} dibFrame
 *
 * @typedef NodeDepthImageBasedStereoOptions
 * @property {NodeDepthImageBasedStereoInput} input
 * @property {NodeDepthImageBasedStereoOutput} output
 * @property {MediaInfo} media
 * @property {SampleLayout} layout
 * @property {string} [uiId]
 * @property {string} [tag]
 * @property {QueuingStrategy<any[]>} [writableStrategy]
 * @property {QueuingStrategy<any[]>} [readableStrategy]
 *
 * @typedef DepthImageBasedStereoOptions
 * @property {number} separation
 * @property {number} focus
 * @property {number} gamma
 * @property {boolean} swapLR
 *
 */
