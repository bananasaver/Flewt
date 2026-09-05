import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { tools } from "../data/tools";
import UploadBox from "../components/UploadBox";
import { downloadBytes } from "../utils/download";
import { mergePdfs, extractPages, rotatePdf, deletePages, resavePdf, imagesToPdf } from "../utils/pdfTools";

export default function ToolPage() {
  const { slug } = useParams();
  const tool = useMemo(()=>tools.find(t=>t.slug===slug), [slug]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [pageText, setPageText] = useState("1");
  const [busy, setBusy] = useState(false);

  if (!tool) return <section className="section"><div className="container"><h1>Tool not found</h1><Link to="/tools">Back to tools</Link></div></section>;

  const run = async () => {
    setMessage("");
    setBusy(true);
    try {
      if (tool.status === "coming") throw new Error("This tool is part of the Flewt production roadmap and is not connected to the processing backend yet.");
      if (!files.length) throw new Error("Choose a file first.");
      let bytes, name;
      if (slug === "merge-pdf") {
        bytes = await mergePdfs(files); name = "flewt-merged.pdf";
      } else if (slug === "split-pdf") {
        bytes = await extractPages(files[0], pageText.split(",").map(Number)); name = "flewt-pages.pdf";
      } else if (slug === "delete-pdf-pages") {
        bytes = await deletePages(files[0], pageText.split(",").map(Number)); name = "flewt-edited.pdf";
      } else if (slug === "rotate-pdf") {
        bytes = await rotatePdf(files[0], 90); name = "flewt-rotated.pdf";
      } else if (slug === "compress-pdf") {
        bytes = await resavePdf(files[0]); name = "flewt-compressed.pdf";
      } else if (slug === "image-to-pdf") {
        bytes = await imagesToPdf(files); name = "flewt-images.pdf";
      } else {
        throw new Error("This tool is not connected.");
      }
      downloadBytes(bytes, name, "application/pdf");
      setMessage("Done — your file has been created and downloaded.");
    } catch (e) {
      setMessage(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const needsPages = ["split-pdf","delete-pdf-pages"].includes(slug);
  const multiple = slug === "merge-pdf" || slug === "image-to-pdf";
  const accept = slug === "image-to-pdf" ? "image/jpeg,image/png" : "application/pdf";

  return (
    <section className="section">
      <div className="container tool-page">
        <Link className="back-link" to="/tools"><ArrowLeft size={16}/> All tools</Link>
        <div className="tool-title-row">
          <div><span className="eyebrow">Flewt tool</span><h1 className="page-title">{tool.name}</h1><p className="page-lead">{tool.description}</p></div>
          {tool.status === "live" && <span className="live-pill"><CheckCircle2 size={15}/> Live</span>}
        </div>
        <div className="tool-workspace">
          <UploadBox accept={accept} multiple={multiple} onFiles={setFiles}/>
          {files.length > 0 && <div className="file-list"><strong>Selected</strong>{files.map(f=><div key={f.name}>{f.name}</div>)}</div>}
          {needsPages && <label className="field"><span>Page numbers</span><input value={pageText} onChange={e=>setPageText(e.target.value)} placeholder="e.g. 1,3,5" /><small>For split: pages to extract. For delete: pages to remove.</small></label>}
          <button className="button button-dark button-large full" onClick={run} disabled={busy}>{busy ? "Working..." : "Run tool"}</button>
          {message && <div className={message.startsWith("Done") ? "notice success" : "notice"}>{message}</div>}
        </div>
        <div className="tool-note"><strong>About this tool</strong><p>Flewt is designed so processing can move from lightweight browser operations to secure server-side processing as the production backend is connected.</p></div>
      </div>
    </section>
  );
}
