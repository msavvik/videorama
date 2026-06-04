<h4>Project structure</h4>
<ul>

  ```
  src/
    ├── kinematoscope/          # 2D to 3D video conversion application
    ├── upscale/                # Video upscaling application
    ├── lib/                    # Shared libraries
    │   ├── pipeline/           # Processing pipeline
    |   |   ├── node/           # Pipeline nodes
    |   |   ├── node-worker/    # WebWorker wrapper
    |   |   └── ...
    │   └── ...
    ├── ui/                     # UI components
    ├── style/                  # HTML css styling
    └── ...

  public/
    ├── model/                  # Sample model files
    ├── media/                  # Sample media files
    ├── config/                 # Configuration files
    └── ...

  docs/                         # documentation
  ```
</ul>

<h4>Implementation</h4>

<ul>
  <p>Applications process data using <a href="https://developer.mozilla.org/en-US/docs/Web/API/Streams_API">Streams API</a> based pipeline.
  <br>
  Pipeline process data in chunks. Data chunk is a placeholder for data elements produced and consumed by pipeline nodes.</p>
  <p>Source nodes inject a data chunk, initialised with source created data elements, into processing pipeline.</p>
  <p>Transform nodes offload processing to dedicated web workers.</p>
  <p>Sink nodes perform data chunk cleanup.</p>
  <p>Pipeline node configuration is set at instantiation; options are set at runtime. Nodes with runtime options have a simple, key controlled, UI allowing options adjustment.
  </p>
</ul>

<h4>Pipeline nodes</h4>

<ul>
  <table>
    <thead>
      <tr>
        <th>Node</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><center><code>SourceVideoElementPush</code></center></td>
        <td>source</td>
        <td>Captures video frames from underlying HTMLVideoElement. Captured frames are "pushed" into pipeline at video frame rate.</td>
      </tr>
      <tr>
        <td><center><code>NodeScaleVideoFrame</code></center></td>
        <td>transform</td>
        <td>Changes video frame resolution.</td>
      </tr>
      <tr>
        <td><center><code>NodeImageSampler</code></center></td>
        <td>transform</td>
        <td>Converts image source into input tensor data.</td>
      </tr>
      <tr>
        <td><center><code>NodeInfer</code></center></td>
        <td>transform</td>
        <td>Performs inference.</td>
      </tr>
      <tr>
        <td><center><code>NodeDepthMap</code></center></td>
        <td>transform</td>
        <td>Converts inference data into depth map data.</td>
      </tr>
      <tr>
        <td><center><code>NodeDepthImageBasedStereo</code></center></td>
        <td>transform</td>
        <td>
        Generates stereo image pair from image source and associated depth map data.
        <p></p>
        Conversion process is <strong><i>very</i></strong> simplistic.
        <br>
        Source image pixels are displaced by a value derived from:
        <ul>
          <li>Pixel's depth.</li>
          <li>Eye separation.</li>
          <li>Focus distance.</li>
          <li>Gamma. Non linear displacement value modifier.</li>
        </ul>
        <p></p>
        Quality improving features like:
        <ul>
          <li>inpainting of disoccluded regions.</li>
          <li>auto distance / focus sensing.</li>
          <li>etc.</li>
        </ul>
          are not present.
        </td>
      </tr>
      <tr>
        <td><center><code>NodeParallax</code></center></td>
        <td>transform</td>
        <td>Renders parallax effect using source image and associated depth map data.
        <p></p>
        Parallax effect is mouse controlled.
        </td>
      </tr>
      <tr>
        <td><center><code>NodeStereoSideBySide</code></center></td>
        <td>transform</td>
        <td>Renders stereo image pair side by side.</td>
      </tr>
      <tr>
        <td><center><code>NodeStereoFrameSwitch</code></center></td>
        <td>transform</td>
        <td>Alternates rendering of the left and right frames of a stereo image pair at the panel refresh rate.</td>
      </tr>
      <tr>
        <td><center><code>NodeViewImage</code></center></td>
        <td>transform</td>
        <td>Renders source image.</td>
      </tr>
      <tr>
        <td><center><code>NodeViewSample</code></center></td>
        <td>transform</td>
        <td>
          Renders source data using one of the following method:
        <ul>
          <p></p>
          <li><i>colour map</i>
            <p>Sample values range is mapped onto colour map lookup table index.</p>
          </li>
          <p></p>
          <li><i>sample / component min-max</i>
          <p>Sample data is mapped onto rendering range (0-255 pe component) based on overall sample value or per-component sample value.</p>
          </li>
          <p></p>
          <li><i>normalise</i>
            <p>Applies normalisation (norm/coeff) to sample.</p>
          </li>
        </ul>
      </td>
      </tr>
      <tr>
        <td><center><code>SinkChunk</code></center></td>
        <td>sink</td>
        <td>Cleans data chunk. Invokes <code>close()</code> on implementing data elements.</td>
      </tr>
    </tbody>
  </table>
</ul>

<h4>Test rig</h4>

<ul>
Windows 11, Chromium browser, Intel i7-11800H, Nvidia 3070 (mobile).
</ul>

<h4>Runtime performance</h4>

<ul>
  <p>
  Test rig, sample media, WebGPU inference performance:
  <ul>
    <li>kinematoscope:
      <br>
      ~20-50+ fps @ 20%-25% of 960x960 resolution.
    </li>
    <li>upscale:
      <br>
      ~25-55+ fps @ 128x128 resolution. Non tiled.
    </li>
  </ul>
  </p>

  > [!TIP]
  > On multi GPU systems, assure browser uses most performant GPU.

  > [!NOTE]
  > Test rig optimal performance is achieved when browser runs on internal display.

</ul>

<h4>Sample models</h4>
<ul>
  Test rig performance of ~25+ fps is key driver behind sample model selection.

  Beefier HW setups will benefit from using more demanding models / input resolutions.
</ul>
