import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './PageHero.css'

export default function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero__shape page-hero__shape--top" />
      <div className="page-hero__shape page-hero__shape--bottom" />
      <div className="page-hero__inner section-shell">
        <div className="page-hero__content">
          <div className="page-hero__eyebrow"><span />{eyebrow}</div>
          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__text">{text}</p>
          <Link to="/contact" className="brand-button page-hero__action">Talk to us <ArrowRight size={18} /></Link>
        </div>
      </div>
    </section>
  )
}
