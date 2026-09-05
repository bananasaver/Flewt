import * as Icons from "lucide-react";
import { Link } from "react-router-dom";

export default function ToolCard({ tool }) {
  const Icon = Icons[tool.icon] || Icons.Wrench;
  return (
    <Link to={`/tools/${tool.slug}`} className="tool-card">
      <span className="tool-icon"><Icon size={21}/></span>
      <span className="tool-card-copy">
        <strong>{tool.name}</strong>
        <span>{tool.description}</span>
      </span>
      {tool.status === "coming" && <span className="status-pill">Soon</span>}
    </Link>
  );
}
