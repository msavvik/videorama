// @ts-ignore
import vsSrc from "./shader/fs-quad.vert?raw";
// @ts-ignore
import fsMRTsrc from "./shader/lr-stereo.frag?raw";
// @ts-ignore
import fsCompSrc from "./shader/lr-compose.frag?raw";

import { DepthImageBasedStereoDefaults } from "./dib-stereo-defaults";

export class DepthImageBasedStereo {
  /**
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {number} width
   * @param {number} height
   */
  static createFrameTexture(glc, width, height) {
    const tex = glc.createTexture();

    glc.bindTexture(glc.TEXTURE_2D, tex);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);

    glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, true);
    glc.pixelStorei(glc.UNPACK_COLORSPACE_CONVERSION_WEBGL, glc.BROWSER_DEFAULT_WEBGL);

    glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGB, width, height, 0, glc.RGB, glc.UNSIGNED_BYTE, null);
    glc.bindTexture(glc.TEXTURE_2D, null);

    return tex;
  }

  /**
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {number} width
   * @param {number} height
   */
  static createDepthTexture(glc, width, height) {
    const tex = glc.createTexture();

    glc.bindTexture(glc.TEXTURE_2D, tex);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);

    glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, true);

    glc.texImage2D(glc.TEXTURE_2D, 0, glc.R32F, width, height, 0, glc.RED, glc.FLOAT, null);
    glc.bindTexture(glc.TEXTURE_2D, null);

    return tex;
  }

  /**
   * Create MRT FBO + two RGBA8 targets
   *
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {number} w
   * @param {number} h
   */
  static createMRT(glc, w, h) {
    const texL = glc.createTexture();
    const texR = glc.createTexture();
    const fb = glc.createFramebuffer();

    glc.bindFramebuffer(glc.FRAMEBUFFER, fb);

    [texL, texR].forEach((t, i) => {
      glc.bindTexture(glc.TEXTURE_2D, t);
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, w, h, 0, glc.RGBA, glc.UNSIGNED_BYTE, null);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
      glc.framebufferTexture2D(glc.FRAMEBUFFER, glc.COLOR_ATTACHMENT0 + i, glc.TEXTURE_2D, t, 0);
      glc.bindTexture(glc.TEXTURE_2D, null);
    });

    glc.drawBuffers([glc.COLOR_ATTACHMENT0, glc.COLOR_ATTACHMENT1]);

    return { fb, texL, texR };
  }

  /**
   * Fullscreen quad VAO
   *
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {WebGLBuffer} vaoBuffer
   */
  static configureVAO(glc, vaoBuffer) {
    const vao = glc.createVertexArray();

    glc.bindVertexArray(vao);
    glc.bindBuffer(glc.ARRAY_BUFFER, vaoBuffer);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]), glc.STATIC_DRAW);
    glc.enableVertexAttribArray(0);
    glc.vertexAttribPointer(0, 2, glc.FLOAT, false, 16, 0);
    glc.enableVertexAttribArray(1);
    glc.vertexAttribPointer(1, 2, glc.FLOAT, false, 16, 8);

    return vao;
  }

  /**
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {string} src
   * @param { (typeof WebGL2RenderingContext.VERTEX_SHADER | typeof WebGL2RenderingContext.FRAGMENT_SHADER)} type
   */
  static compile(glc, src, type) {
    const s = glc.createShader(type);

    glc.shaderSource(s, src);
    glc.compileShader(s);

    if (!glc.getShaderParameter(s, glc.COMPILE_STATUS)) throw new Error(glc.getShaderInfoLog(s));

    return s;
  }

  /**
   * @private
   * @param {WebGL2RenderingContext} glc
   * @param {WebGLShader} vs
   * @param {WebGLShader} fs
   */
  static link(glc, vs, fs) {
    const p = glc.createProgram();

    glc.attachShader(p, vs);
    glc.attachShader(p, fs);
    glc.linkProgram(p);

    if (!glc.getProgramParameter(p, glc.LINK_STATUS)) throw new Error(glc.getProgramInfoLog(p));

    return p;
  }

  /**
   * @private
   * @param {OffscreenCanvas} canvas
   */
  static createConfiguredWebGL2Context(canvas) {
    const glc = canvas.getContext("webgl2", { alpha: false, premultipliedAlpha: true, desynchronized: true });

    if (!glc) {
      throw new Error("Error: WebGL2 not supported");
    }
    if (!glc.getExtension("EXT_color_buffer_float")) {
      throw new Error("Error: EXT_color_buffer_float. Browser does not support rendering to float textures.");
    }
    if (!glc.getExtension("OES_texture_float_linear")) {
      console.warn("OES_texture_float_linear. Float textures will sample with nearest‐neighbor filtering.");
    }

    return glc;
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {SampleLayout} depthSample
   * @param {string} [tag]
   */
  static async create(width, height, depthSample, tag) {
    const tagName = tag?.concat(" ", DepthImageBasedStereo.name) ?? DepthImageBasedStereo.name;
    console.debug(tagName, DepthImageBasedStereo.create.name);

    return new DepthImageBasedStereo(width, height, depthSample, tagName);
  }

  /**
   * @private
   * @param {number} width
   * @param {number} height
   * @param {SampleLayout} depthSample
   * @param {string} tag
   */
  constructor(width, height, depthSample, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private @type {number} */
    this.textureL = undefined;
    /** @private @type {number} */
    this.textureR = undefined;
    /** @private */
    this.options = { ...DepthImageBasedStereoDefaults.options };
    this.setOptionSwapLR();

    /** @private */
    this.sampleWidth = depthSample.width;
    /** @private */
    this.sampleHeight = depthSample.height;
    /** @private */
    this.frameWidth = width;
    /** @private */
    this.frameHeight = height;
    // /** @private */
    // this.sampleType = SampleBuffer.dataType(depthSample);

    /** @private */
    this.canvas = new OffscreenCanvas(this.frameWidth * 2, this.frameHeight);
    /** @private */
    this.gl = DepthImageBasedStereo.createConfiguredWebGL2Context(this.canvas);

    // Build programs
    const vs = DepthImageBasedStereo.compile(this.gl, vsSrc, this.gl.VERTEX_SHADER);
    const fsMRT = DepthImageBasedStereo.compile(this.gl, fsMRTsrc, this.gl.FRAGMENT_SHADER);
    const fsComp = DepthImageBasedStereo.compile(this.gl, fsCompSrc, this.gl.FRAGMENT_SHADER);
    /** @private */
    this.progMRT = DepthImageBasedStereo.link(this.gl, vs, fsMRT);
    /** @private */
    this.progComp = DepthImageBasedStereo.link(this.gl, vs, fsComp);

    // Clean programs
    this.gl.deleteShader(vs);
    this.gl.deleteShader(fsMRT);
    this.gl.deleteShader(fsComp);

    /** @private */
    this.bufferVAO = this.gl.createBuffer();
    /** @private */
    this.quadVAO = DepthImageBasedStereo.configureVAO(this.gl, this.bufferVAO);
    /** @private */
    this.mrt = DepthImageBasedStereo.createMRT(this.gl, this.frameWidth, this.frameHeight);
    /** @private */
    this.depthTex = DepthImageBasedStereo.createDepthTexture(this.gl, this.sampleWidth, this.sampleHeight);
    /** @private */
    this.colorTex = DepthImageBasedStereo.createFrameTexture(this.gl, this.frameWidth, this.frameHeight);
  }

  render() {
    // Pass 1: render left/right to MRT
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.mrt.fb);
    this.gl.viewport(0, 0, this.frameWidth, this.frameHeight);
    this.gl.useProgram(this.progMRT);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTex);
    this.gl.uniform1i(this.gl.getUniformLocation(this.progMRT, "u_color"), 0);

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTex);
    this.gl.uniform1i(this.gl.getUniformLocation(this.progMRT, "u_depth"), 1);

    this.gl.uniform1f(this.gl.getUniformLocation(this.progMRT, "u_eyeSeparation"), this.options.separation);
    this.gl.uniform1f(this.gl.getUniformLocation(this.progMRT, "u_focusDistance"), this.options.focus);
    this.gl.uniform1f(this.gl.getUniformLocation(this.progMRT, "u_gamma"), this.options.gamma);

    this.gl.bindVertexArray(this.quadVAO);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Pass 2: compose left/right to default framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.useProgram(this.progComp);

    this.gl.activeTexture(this.textureL);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.mrt.texL);
    this.gl.uniform1i(this.gl.getUniformLocation(this.progComp, "u_texLeft"), 0);

    this.gl.activeTexture(this.textureR);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.mrt.texR);
    this.gl.uniform1i(this.gl.getUniformLocation(this.progComp, "u_texRight"), 1);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * @private
   * @param {VideoFrame} frame
   */
  updateFrameTexture(frame) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTex);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGB,
      this.frameWidth,
      this.frameHeight,
      0,
      this.gl.RGB,
      this.gl.UNSIGNED_BYTE,
      frame
    );
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  /**
   * @private
   * @param {ArrayBuffer} data
   */
  updateDepthTexture(data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTex);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.R32F,
      this.sampleWidth,
      this.sampleHeight,
      0,
      this.gl.RED,
      this.gl.FLOAT,
      new Float32Array(data)
    );
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  /** @private */
  setOptionSwapLR() {
    console.debug(this.tag, this.setOptionSwapLR.name, "swap:", this.options.swapLR);

    if (this.options.swapLR) {
      this.textureL = WebGL2RenderingContext.TEXTURE1;
      this.textureR = WebGL2RenderingContext.TEXTURE0;
    } else {
      this.textureL = WebGL2RenderingContext.TEXTURE0;
      this.textureR = WebGL2RenderingContext.TEXTURE1;
    }
  }

  /**
   * @param {DepthImageBasedStereoOptions} data
   */
  setOptions(data) {
    console.debug(this.tag, this.setOptions.name, data);

    Object.assign(this.options, data);
    this.setOptionSwapLR();
  }

  /**
   * @param {[VideoFrame, ArrayBuffer]} data
   */
  process(data) {
    this.updateDepthTexture(data[1]);
    this.updateFrameTexture(data[0]);
    this.render();

    const sync = this.gl.fenceSync(this.gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    this.gl.flush();
    this.gl.waitSync(sync, 0, this.gl.TIMEOUT_IGNORED);
    this.gl.deleteSync(sync);

    return new VideoFrame(this.canvas, {
      alpha: "discard",
      timestamp: data[0].timestamp,
      duration: data[0].duration
    });
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.gl.deleteProgram(this.progMRT);
    this.progMRT = undefined;
    this.gl.deleteProgram(this.progComp);
    this.progComp = undefined;
    this.gl.deleteVertexArray(this.quadVAO);
    this.quadVAO = undefined;
    this.gl.deleteBuffer(this.bufferVAO);
    this.bufferVAO = undefined;
    this.gl.deleteFramebuffer(this.mrt.fb);
    this.gl.deleteTexture(this.mrt.texL);
    this.gl.deleteTexture(this.mrt.texR);
    this.mrt.fb = undefined;
    this.mrt.texL = undefined;
    this.mrt.texR = undefined;
    this.mrt = undefined;
    this.gl.deleteTexture(this.depthTex);
    this.depthTex = undefined;
    this.gl.deleteTexture(this.colorTex);
    this.colorTex = undefined;

    this.gl = undefined;
    this.canvas = undefined;
    this.options = undefined;
  }
}
