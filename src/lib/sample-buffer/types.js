/**
 * @typedef {( "int8" | "uint8" | "uint8c" | "int16" | "uint16" | "float16" | "int32" | "uint32" | "float32" | "float64" )} SampleDataType
 * @typedef {( "interleaved" | "planar" )} SampleDataLayout
 *
 * @typedef {("n" | "N" | "s" | "S" | "c" | "C" | "h" | "H" | "w" | "W")} SampleTensorDimentionTemplate
 * @typedef {( SampleTensorDimentionTemplate | number)} SampleTensorDimentionEntry
 * @typedef {SampleTensorDimentionEntry[]} SampleTensorDimention
 *
 * @typedef SampleTensor
 * @property {number} [batch]
 * @property {number} [sample]
 * @property {number} [channel]
 * @property {number} [height]
 * @property {number} [width]
 *
 *
 * @typedef SampleLayout
 * @property {SampleTensorDimention} [dimension]
 * @property {SampleTensor} [tensor]
 * @property {string} format component format
 * @property {SampleDataLayout} layout data layout
 * @property {SampleDataType} type data type name
 * @property {number} height data height
 * @property {number} width data width
 * @property {number[]} [norm] per component normalization factor
 * @property {number[]} [bias] per component bias
 *
 * @typedef SampleNormOptions subset of SampleLayout properties for constructing SampleNorm
 * @property {string} format see {@link SampleLayout.format}
 * @property {number[]} [norm] see {@link SampleLayout.norm}
 * @property {number[]} [bias] see {@link SampleLayout.bias}
 *
 * @typedef {("r"|"g"|"b"|"a")} SampleComponentName
 * 
 * @typedef IComponentNameIndex
 * @property {number} [r]
 * @property {number} [g]
 * @property {number} [b]
 * @property {number} [a]
 */
