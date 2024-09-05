import { ChangeEvent, useEffect, useState } from "react";
import { getZXingModule, readBarcodesFromImageFile } from "zxing-wasm/reader";

import "./App.css";

type QRInfo = {
  format: string;
  text: string;
  xTopLeft: number;
  yTopLeft: number;
  xBottomRight: number;
  yBottomRight: number;
};

function setWasmUrl() {
  const [isFetch, setIsFetch] = useState(true);
  useEffect(() => {
    if (!isFetch) {
      return;
    }
    getZXingModule({
      locateFile: () => {
        return "/wasm/reader/zxing_reader.wasm";
      },
    }).then(() => setIsFetch(false));
  }, [isFetch]);
}

async function readQRCode(file: File): Promise<QRInfo[]> {
  const resp = await readBarcodesFromImageFile(file);
  return resp.map((item) => {
    return {
      format: item.format,
      text: item.text,
      xTopLeft: item.position.topLeft.x,
      yTopLeft: item.position.topLeft.y,
      xBottomRight: item.position.bottomRight.x,
      yBottomRight: item.position.bottomRight.y,
    };
  });
}

function generateDataUrl(file: File): Promise<string> {
  return new Promise<string>((ok, err) => {
    const reader = new FileReader();
    reader.addEventListener("error", (e) => {
      err(e);
    });
    reader.addEventListener("load", () => {
      ok(reader.result as string);
    });
    reader.readAsDataURL(file);
  });
}

function App() {
  const [filename, setFilename] = useState("");
  const [mime, setMime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [allInfo, setAllInfo] = useState<QRInfo[]>([]);

  function clear() {
    for (const func of [setFilename, setMime, setImageUrl]) {
      func("");
    }
    setAllInfo([]);
  }

  async function changeFile(e: ChangeEvent<HTMLInputElement>) {
    clear();
    const list = e.target.files;
    if (list == null || list.length !== 1) {
      return;
    }
    const file = list?.item(0);
    console.log(file);
    if (file == null) {
      return;
    }

    setFilename(file.name);
    setMime(file.type);
    try {
      const url = await generateDataUrl(file);
      setImageUrl(url);
    } catch (e) {
      alert(e);
    }
    const info = await readQRCode(file);
    setAllInfo(info);
  }

  setWasmUrl();

  const elmImage =
    imageUrl.length === 0 ? null : (
      <p id="pimg">
        <img id="image" src={imageUrl} alt="image" />
      </p>
    );

  const tables = allInfo.map((item, i) => (
    <table key={i}>
      <tbody>
        <tr>
          <th>Format</th>
          <td>{item.format}</td>
        </tr>
        <tr>
          <th>Text</th>
          <td>{item.text}</td>
        </tr>
        <tr>
          <th>Position</th>
          <td>
            ({item.xTopLeft}, {item.yTopLeft}), ({item.xBottomRight},{" "}
            {item.yBottomRight})
          </td>
        </tr>
      </tbody>
    </table>
  ));

  return (
    <>
      <h1>zxing-wasm qrcode test</h1>
      <p>
        <input type="file" onChange={changeFile} />
      </p>
      <table>
        <tbody>
          <tr>
            <th>Filename</th>
            <td>{filename}</td>
          </tr>
          <tr>
            <th>MIME Type</th>
            <td>{mime}</td>
          </tr>
        </tbody>
      </table>
      {tables}
      {elmImage}
    </>
  );
}

export default App;
