import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main section-shell">
        <div className="footer__brand-block">
          <img src="/amazing-logo.png" alt="Amazing Accountant and Tax Services" className="footer__logo" />
          <p className="footer__description">Professional accounting and tax services designed to make your financial life simpler, clearer, and more organized.</p>
        </div>
        <div><h3 className="footer__heading">Company</h3><div className="footer__links"><Link to="/about">About Us</Link><Link to="/services">Services</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link></div></div>
        <div><h3 className="footer__heading">Services</h3><div className="footer__links"><Link to="/services/individual-tax">Individual Tax</Link><Link to="/services/business-tax">Business Tax</Link><Link to="/services/accounting">Accounting</Link><Link to="/services/bookkeeping">Bookkeeping</Link></div></div>
        <div><h3 className="footer__heading">Get in touch</h3><div className="footer__contact-list"><div className="footer__contact-item"><Phone size={17}/><span>Contact us for service details</span></div><div className="footer__contact-item"><Mail size={17}/><span>Send us a message</span></div><div className="footer__contact-item"><MapPin size={17}/><span>Serving individuals and businesses</span></div></div></div>
      </div>
      <div className="footer__bottom"><div className="footer__bottom-inner section-shell"><span>© 2026 Amazing Accountant and Tax Services. All rights reserved.</span><div className="footer__legal-links"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></div></div></div>
    </footer>
  )
}
