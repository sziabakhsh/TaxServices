import {
  ArrowRight,
  Building2,
  Calculator,
  FileCheck2,
  FileText,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import PageHero from '../../components/PageHero'
import Footer from '../../components/Footer'
import Navbar from '../../components/Navbar'

import './ServicesPage.css'

type Service = {
  href: string
  icon: LucideIcon
  title: string
  text: string
}

const services: Service[] = [
  {
    href: '/services/individual-tax',
    icon: UserRound,
    title: 'Individual Tax Services',
    text: 'Personal tax support focused on accuracy, organization, and a smoother filing experience.',
  },
  {
    href: '/services/business-tax',
    icon: Building2,
    title: 'Business Tax Services',
    text: 'Practical tax support for businesses, owners, and ongoing tax responsibilities.',
  },
  {
    href: '/services/accounting',
    icon: Calculator,
    title: 'Accounting Services',
    text: 'Keep your financial information organized and make better-informed business decisions.',
  },
  {
    href: '/services/bookkeeping',
    icon: FileText,
    title: 'Bookkeeping Services',
    text: 'Accurate, consistent records that help you understand where your business stands.',
  },
  {
    href: '/services/tax-compliance',
    icon: FileCheck2,
    title: 'Tax Filing & Compliance',
    text: 'Stay organized with professional support for tax filing and compliance needs.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main>
        <PageHero
          eyebrow="OUR SERVICES"
          title="Accounting and tax services built around your needs."
          text="From personal tax matters to business accounting and bookkeeping, we provide practical services designed to keep your financial responsibilities organized."
        />

        <section className="services-page">
          <div className="section-shell services-page__grid">
            {services.map((service) => {
              const Icon = service.icon

              return (
                <article
                  key={service.title}
                  className="glass-card services-page__card"
                >
                  <div className="services-page__icon">
                    <Icon size={27} />
                  </div>

                  <h2>{service.title}</h2>

                  <p>{service.text}</p>

                  <Link to={service.href}>
                    Explore service
                    <ArrowRight size={16} />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}