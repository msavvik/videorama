/**
 * @typedef {("Normalise"|"ColourMap"|"MinMaxSample"|"MinMaxComponent")} ViewSampleMethod
 *
 * @typedef OptionsViewSample
 * @property {SampleLayout} sample
 * @property {ViewSampleMethod} method
 * @property {number[]} [norm]
 * @property {number[]} [bias]
 * @property {string} [colourMap]
 *
 * @typedef NodeViewSampleInput
 * @property {number} sample
 *
 * @typedef OptionsViewSampleNode
 * @property {NodeViewSampleInput} input
 * @property {Size} [displaySize]
 * @property {string} containerId
 * @property {string} [controlId]
 * @property {string} [tag]
 * @property {QueuingStrategy<any[]>} [writableStrategy]
 * @property {QueuingStrategy<any[]>} [readableStrategy]
 *
 * @typedef {(OptionsViewSample & OptionsViewSampleNode)} NodeViewSampleOptions
 */
