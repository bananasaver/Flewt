import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categories, tools } from "../data/tools";
import ToolCard from "../components/ToolCard";

export default function Tools() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = useMemo(() => tools.filter(t => {
    const matchesCat = category === "all" || t.category === category;
    const hay = `${t.name} ${t.description}`.toLowerCase();
    return matchesCat && hay.includes(query.toLowerCase());
  }), [query, category]);
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Flewt toolbox</span>
        <h1 className="page-title">All the useful bits.</h1>
        <p className="page-lead">PDFs, documents, images, text and everyday utilities — designed to be quick to find and simple to use.</p>
        <div className="tool-controls">
          <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tools..." /></div>
          <div className="category-tabs">
            <button className={category==="all"?"active":""} onClick={()=>setCategory("all")}>All</button>
            {categories.map(c=><button key={c.id} className={category===c.id?"active":""} onClick={()=>setCategory(c.id)}>{c.name.replace(" & Documents","")}</button>)}
          </div>
        </div>
        <div className="tool-grid">{filtered.map(t=><ToolCard key={t.slug} tool={t}/>)}</div>
        {!filtered.length && <div className="empty-state">No tools match that search.</div>}
      </div>
    </section>
  );
}
