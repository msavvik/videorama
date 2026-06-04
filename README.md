<h3>Videorama</h3>

<ul>
  Playground for browser-based, AI-powered, video and image processing toys.
</ul>

<h4>Toys</h4>

<ul>
  Toy applications to play with:
  <table>
    <tr><th>Application</th><th>Description</th></tr>
    <tr>
      <td><a href="/docs/kinematoscope/">kinematoscope</a></td>
      <td>2D to 3D video conversion using monocular depth estimation.</td>
    </tr>
    <tr>
      <td><a href="/docs/upscale/">upscale</a></td><td>Video super-resolution upscaling. Non Tiled.</td>
    </tr>
  </table>
</ul>

<h4>Setup</h4>

<ul>
  <li>Sources:
  
  ```
  git clone https://github.com/msavvik/videorama.git
  ```
  </li>

  <li>Dependencies:

  ```
  cd videorama
  npm install
  ```
  </li>
  
  <li>Sample resources:
  
  Download sample model and media files from a google drive.
  <ul>
    <li><a href="https://drive.google.com/drive/folders/12dDQm50mLZY-P5oVhbMQRqr5AIBJgMoj">model files</a></li>
    <li><a href="https://drive.google.com/drive/folders/1pqBogeS3IWTTsq5dWU1QjILgpY8k42n2">media files</a></li>
  </ul>
  
  Extract `.zip` files to corresponding locations in the `/public` directory.

  ```
  public/
    ├── media/
      ├── dance/
      ├── peru/
      └── ...
    ├── model/
      ├── depth_anything_v1_base/
      ├── quicksrnet/
      └── ...
    └── ...
  ```

  Sample resources:

  <table>
    <tr><th>resource</th><th>kinematoscope</th><th>upscale</th></tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1MigLe7GNOyDG913ha0mwpTP5g7c4SZWk">depth_anything_v1_base</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=19UTCbzODv2y5aYgBnDOoUOSd8VZ9hEHT">depth_anything_v1_small</td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1_vhtIdY1Uo9PFhNmS11kTpV29Vmpt_8T">depth_anything_v2_base</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1RtgqXpVdi-LA2FfZGXt5PTkXIAPqthpf">depth_anything_v2_small</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1fNIOAioEEFC4aCgEopWzYW2Dxi-MtYWk">depth_anything_v3_base</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1QWO31CBAZftPU52kvmo6GBja41tHYfpD">depth_anything_v3_small</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=10jFcbuNZelXh49wp3p7NSC_O3UEhQWr4">midas_v2.1_small</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1D3qiZZ_BPGQqqtEYqSEZxcV4C8eOEzae">midas_v3.1_dpt_swin2_tiny</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Red}✗}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1pnxahVIFdQVONwBznFtfJ4Pb11IJDc5H">quicksrnet</a></td>
      <td align="center">${\color{Red}✗}$</td>
      <td align="center">${\color{Green}✓}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1mJIHRe9sJWvvitG1D_qmqQOe-gag6NhW">sesr_m5</a></td>
      <td align="center">${\color{Red}✗}$</td>
      <td align="center">${\color{Green}✓}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1HFOidMJa8VzZ2pxqcXVXyuq3OKU2-bGS">xlsr</a></td>
      <td align="center">${\color{Red}✗}$</td>
      <td align="center">${\color{Green}✓}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1LqgTBANUtL8yK3Xp3jsa-VCiBQfzWDea">peru</a></td>
      <td align="center">${\color{Green}✓}$</td>
      <td align="center">${\color{Yellow}-}$</td>
    </tr>
    <tr>
      <td><a href="https://drive.usercontent.google.com/download?id=1HDTARXGxv0nHiGcDiLFf1pPkoIiGXpqY">dance</a></td>
      <td align="center">${\color{Yellow}-}$</td>
      <td align="center">${\color{Green}✓}$</td>
    </tr>
  </table>
  </li>
 
  <li>Run dev server

  ```
  npm run dev
  ```

  Access applications at [http://localhost:8081/](http://localhost:8081/)
  </li>
</ul>

<h4>Tech insights</h4>
<ul>
  For additional information, check:
  <ul>
    <li><a href="/docs/dev_notes/">development notes</a></li>
    <li><a href="/docs/kinematoscope/">kinematosope application notes</a></li>
    <li><a href="/docs/upscale/">upscale application notes</a></li>
  </ul>
</ul>