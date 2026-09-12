import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { CATEGORIES } from '../toolRegistry.js';
import './Tools.css';

export default function Tools() {
  return (
    <div className="wrap tools-page">
      <div className="tool-header">
        <h1>Every tool, grouped by what you're trying to get done.</h1>
        <p>Pick a category, then just use a tool directly — you'll see the price right before it runs.</p>
      </div>
      <div className="category-grid">
        {CATEGORIES.map((c) => (
          <Link to={`/tools/${c.slug}`} key={c.slug} className={`category-card pastel-${c.color}`}>
            <span className="category-icon"><Icon name={c.icon} /></span>
            <h3>{c.name}</h3>
            <p>{c.tagline}</p>
            {c.comingSoon && <span className="category-soon-badge">New</span>}
          </Link>
        ))}
      </div>
      <p className="tools-more-note">Templates, fonts management, and more — coming soon.</p>
    </div>
  );
}
