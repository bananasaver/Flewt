import { Link, useParams, Navigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { findCategory } from '../toolRegistry.js';
import './Tools.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = findCategory(slug);

  if (!category) return <Navigate to="/tools" replace />;

  return (
    <div className="wrap tools-page">
      <div className="tool-header">
        <Link to="/tools" className="category-back">← All categories</Link>
        <div className="category-header-row">
          <Icon name={category.icon} size={36} />
          <h1>{category.name}</h1>
        </div>
        <p>{category.tagline}</p>
      </div>
      <div className="tools-grid">
        {category.tools.map((t) => (
          <Link to={t.to} key={t.to} className="tool-card">
            <h3>{t.name}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
