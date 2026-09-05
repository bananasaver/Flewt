import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="Flewt home">
          <img src="/assets/flewtlogo.png" alt="Flewt" className="brand-logo" onError={(e)=>e.currentTarget.classList.add("logo-missing")} />
        </Link>
        <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          <NavLink to="/tools" onClick={()=>setOpen(false)}>Tools</NavLink>
          <NavLink to="/pricing" onClick={()=>setOpen(false)}>Pricing</NavLink>
          <NavLink to="/about" onClick={()=>setOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={()=>setOpen(false)}>Contact</NavLink>
          <div className="nav-actions">
            <Link className="button button-ghost" to="/login" onClick={()=>setOpen(false)}>Log in</Link>
            <Link className="button button-dark" to="/signup" onClick={()=>setOpen(false)}>Get started</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
