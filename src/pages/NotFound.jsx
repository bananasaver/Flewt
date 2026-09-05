import { Link } from "react-router-dom";
export default function NotFound(){return <section className="section"><div className="container narrow center"><span className="eyebrow">404</span><h1 className="page-title">That page has moved.</h1><p className="page-lead">Let's get you back to the tools.</p><Link className="button button-dark" to="/tools">Browse tools</Link></div></section>}
