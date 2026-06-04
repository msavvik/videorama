/**
 * @typedef DepthMapRange
 * @property {number} min
 * @property {number} max
 *
 * @typedef {DepthMapRange} DepthMapOptions
 * 
 * @typedef DepthMapCreateOptions
 * @property {SampleLayout} sample
 * @property {SampleLayout} depth
 * @property {boolean} [invertRange]
 *
 * @typedef NodeDepthMapInput
 * @property {number} sample
 *
 * @typedef NodeDepthMapOutput
 * @property {number} sample
 *
 * @typedef NodeDepthMapOptions
 * @property {NodeDepthMapInput} input
 * @property {NodeDepthMapOutput} output
 * @property {SampleLayout} sample
 * @property {SampleLayout} depth
 * @property {DepthMapRange[]} rangeOptions
 * @property {string} [uiId]
 * @property {string} [tag]
 * @property {boolean} [invertRange]
 * @property {QueuingStrategy<any[]>} [writableStrategy]
 * @property {QueuingStrategy<any[]>} [readableStrategy]
 */
