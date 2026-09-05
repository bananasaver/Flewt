import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  { name:"Free", price:"£0", note:"For occasional jobs", features:["Core tools","Generous daily allowance","No card required"] },
  { name:"Flewt", price:"£2.99", note:"For regular users", features:["More usage","Larger files","Faster processing","File history"] },
  { name:"Flewt Plus", price:"£4.99", note:"For heavy users", features:["Higher limits","Advanced tools","OCR when available","Priority processing"] }
];

export default function Pricing() {
  return <section className="section"><div className="container"><span className="eyebrow">Pricing</span><h1 className="page-title">Keep the price moving down.</h1><p className="page-lead">These are launch targets, not a promise of final pricing. We'll set the final limits after the real processing costs are known.</p><div className="pricing-grid">{plans.map((p,i)=><div className={`price-card ${i===1?"featured":""}`} key={p.name}>{i===1&&<span className="recommended">Most useful</span>}<h2>{p.name}</h2><div className="price">{p.price}<small>{i===0?"/ month":" / month"}</small></div><p>{p.note}</p><ul>{p.features.map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul><Link className="button button-dark full" to="/signup">Get started</Link></div>)}</div><p className="fine-print">Payments will be connected through Stripe, with supported express methods such as Apple Pay and Google Pay where available.</p></div></section>;
}
