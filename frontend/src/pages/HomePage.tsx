import type { ReactNode } from 'react'
import { ArrowRight, BadgeCheck, Building2, Calculator, Clock3, FileCheck2, FileText, Headphones, ShieldCheck, Tags, UserRound } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './HomePage.css'

const services = [
  { icon: UserRound, title: 'Individual Tax Services', text: 'Maximize your refund and minimize your tax burden.' },
  { icon: Building2, title: 'Business Tax Services', text: 'Strategic tax planning for your business growth.' },
  { icon: Calculator, title: 'Accounting Services', text: 'Keep your finances organized and on track.' },
  { icon: FileText, title: 'Bookkeeping Services', text: 'Accurate records for better business decisions.' },
  { icon: FileCheck2, title: 'Tax Filing & Compliance', text: 'Stay compliant with confidence and peace of mind.' },
]
const benefits = [
  { icon: BadgeCheck, title: 'Experienced Professionals', text: 'Skilled and knowledgeable team' },
  { icon: Headphones, title: 'Personalized Approach', text: 'Solutions tailored to your needs' },
  { icon: ShieldCheck, title: 'Secure & Confidential', text: 'Your data is always protected' },
  { icon: Tags, title: 'Competitive Pricing', text: 'Quality service at fair rates' },
]
function Eyebrow({ children }: { children: ReactNode }) { return <div className="home-eyebrow"><span />{children}</div> }

export default function HomePage() {
  return <div id="top" className="home-page"><Navbar/><main>
    <section className="home-hero">
      <div className="home-hero__inner section-shell">
        <div className="home-hero__content">
          <Eyebrow>YOUR TRUSTED PARTNER IN FINANCIAL SUCCESS</Eyebrow>
          <h1 className="home-hero__title">Professional Accounting<br/><span>and Tax Services</span></h1>
          <p className="home-hero__text">We provide reliable, accurate, and personalized accounting and tax solutions for individuals and businesses. Let us help you save time, reduce stress, and achieve your financial goals.</p>
          <div className="home-hero__actions"><a href="/services" className="brand-button">Our Services <ArrowRight size={18}/></a><a href="/contact" className="outline-button">Get Free Consultation</a></div>
          <div className="home-hero__trust">
            <div className="home-trust-item"><ShieldCheck size={30}/><div><strong>Trusted & Reliable</strong><span>Your success is our priority</span></div></div>
            <div className="home-trust-item"><BadgeCheck size={30}/><div><strong>Expert Guidance</strong><span>Years of experience</span></div></div>
            <div className="home-trust-item"><Clock3 size={30}/><div><strong>Save Time & Money</strong><span>Efficient & accurate service</span></div></div>
          </div>
        </div>
        <div className="home-hero__image" />
      </div>
      <div className="home-hero__shape home-hero__shape--one"/><div className="home-hero__shape home-hero__shape--two"/>
    </section>

    <section id="services" className="home-section"><div className="section-shell"><div className="home-section__header"><div><Eyebrow>OUR SERVICES</Eyebrow><h2 className="home-section__title">Comprehensive Tax & Accounting Solutions</h2><p className="home-section__copy">We offer a full range of accounting and tax services for individuals and businesses. Our goal is to make your financial life easier and more secure.</p></div><a href="/services" className="home-section__link">View All Services <ArrowRight size={17}/></a></div><div className="home-services">{services.map(({icon:Icon,title,text})=><article key={title} className="glass-card home-service-card"><div className="home-service-card__icon"><Icon size={27}/></div><h3>{title}</h3><p>{text}</p><a href="/contact">Learn More <ArrowRight size={14}/></a></article>)}</div></div></section>

    <section id="about" className="home-why"><div className="section-shell"><Eyebrow>WHY CHOOSE US?</Eyebrow><div className="home-why__layout"><h2 className="home-section__title">A better way to manage your finances.</h2><div className="home-benefits">{benefits.map(({icon:Icon,title,text})=><div key={title} className="home-benefit"><Icon size={28}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></div></section>

    <section id="resources" className="home-process"><div className="section-shell home-process__layout"><div><Eyebrow>HOW IT WORKS</Eyebrow><h2 className="home-section__title">Simple, professional, and built around you.</h2><p className="home-section__copy">From your first conversation to completed tax work, we keep the process clear and organized so you always know what comes next.</p><div className="home-steps">{[['1','Tell us what you need','Choose the service that best fits your personal or business needs.'],['2','Work with our team','Get clear guidance and a personalized approach throughout the process.'],['3','Stay organized and informed','Access your information and keep your tax matters moving forward.']].map(([n,t,x])=><div key={n} className="home-step"><span>{n}</span><div><h3>{t}</h3><p>{x}</p></div></div>)}</div></div><div className="home-security"><div className="home-security__card"><ShieldCheck size={42}/><h3>Your information matters.</h3><p>We design our client experience around clarity, privacy, and dependable service.</p><a href="/contact">Talk to us <ArrowRight size={17}/></a></div></div></div></section>

    <section id="faq" className="home-faq"><div className="section-shell home-faq__inner"><Eyebrow>FAQ</Eyebrow><h2 className="home-section__title">Questions? We’re here to help.</h2><p>We’ll build a complete FAQ and resource center here as the public content grows.</p></div></section>
    <section id="contact" className="home-cta"><div className="section-shell home-cta__inner"><div><div className="home-cta__kicker">LET’S GET STARTED</div><h2>Ready to make tax time easier?</h2><p>Connect with Amazing Accountant and Tax Services to discuss your accounting or tax needs.</p></div><a href="/contact" className="home-cta__button">Get Free Consultation <ArrowRight size={18}/></a></div></section>
  </main><Footer/></div>
}
