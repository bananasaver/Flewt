import { UploadCloud } from "lucide-react";
import { useRef } from "react";

export default function UploadBox({ accept, multiple=false, onFiles }) {
  const ref = useRef(null);
  const choose = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
  };
  return (
    <div className="upload-box" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) onFiles(files);
    }}>
      <UploadCloud size={34}/>
      <h3>Drop your file{multiple ? "s" : ""} here</h3>
      <p>or choose from your device</p>
      <button className="button button-dark" onClick={()=>ref.current?.click()}>Choose file{multiple ? "s" : ""}</button>
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden onChange={choose}/>
      <small>Your files are processed only when the selected tool is supported.</small>
    </div>
  );
}
