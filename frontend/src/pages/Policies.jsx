import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Policies.css';

const policies = [
  {
    id: 'shipping',
    title: 'Shipping Policy',
    icon: '📦',
    sections: [
      {
        heading: 'Processing Time',
        body: 'All orders are processed within 1–2 business days. Orders placed on weekends or public holidays will be processed the following business day. During high-demand periods, processing may take up to 3 business days.',
      },
      {
        heading: 'Domestic Shipping (India)',
        body: 'Standard Shipping (5–7 business days): ₹40 or FREE on orders over ₹150. Express Shipping (2–3 business days): ₹75. Overnight Shipping (next business day): ₹135. All orders include a tracking number sent via email upon dispatch.',
      },
      {
        heading: 'International Shipping',
        body: 'We ship to over 40 countries worldwide. International shipping rates and delivery times vary by destination. Customers are responsible for any customs duties, taxes, or import fees imposed by their country. Zarvenza is not liable for delays caused by customs processing.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    icon: '🔄',
    sections: [
      {
        heading: 'Return Eligibility',
        body: 'We accept returns within 30 days of delivery. Items must be unused, unopened, and in their original packaging with all seals intact. For hygiene reasons, opened skincare, makeup, and fragrance products cannot be returned unless they are faulty or not as described.',
      },
      {
        heading: 'How to Initiate a Return',
        body: 'Contact our customer service team at returns@zarvenza.com with your order number and reason for return. We will provide a prepaid return label within 2 business days. Once received, refunds are processed within 5–7 business days to your original payment method.',
      },
      {
        heading: 'Exchanges',
        body: 'We offer one complimentary exchange per order. To exchange an item, please contact us within 14 days of delivery. Exchange items are shipped free of charge within the domestic United States.',
      },
      {
        heading: 'Damaged or Faulty Items',
        body: 'If you receive a damaged or defective product, please contact us within 72 hours of delivery with photo evidence. We will arrange a replacement or full refund at no cost to you.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: '🔒',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide directly to us when making a purchase or creating an account, including your name, email address, postal address, phone number, and payment information. We also collect data about your browsing behaviour on our website to improve your experience.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'Your information is used to process orders, send shipping and order confirmations, provide customer service, and send marketing communications if you have opted in. We do not sell, rent, or share your personal information with third parties for marketing purposes.',
      },
      {
        heading: 'Cookies',
        body: 'Our website uses cookies to enhance your shopping experience. You may disable cookies through your browser settings, though this may affect certain website functionality. We use first-party and third-party cookies for analytics, preferences, and advertising.',
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact privacy@zarvenza.com. We comply with GDPR, CCPA, and all applicable data protection regulations.',
      },
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: '📋',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using the Zarvenza website and placing an order, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.',
      },
      {
        heading: 'Products & Pricing',
        body: 'We reserve the right to modify product descriptions, images, and pricing at any time. Prices are listed in USD unless otherwise specified. We are not responsible for typographical errors. In the event of a pricing error, we will contact you before processing your order.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All content on the Zarvenza website — including text, images, graphics, logos, and product formulations — is the exclusive intellectual property of Zarvenza Ltd. and is protected by applicable copyright and trademark laws.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'Zarvenza shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or services. Our total liability shall not exceed the amount paid for the relevant order.',
      },
    ],
  },
];

function PolicyAccordion({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`policy__accordion ${open ? 'policy__accordion--open' : ''}`}>
      <button className="policy__accordion-btn" onClick={() => setOpen(v => !v)}>
        <span>{section.heading}</span>
        <ChevronDown size={16} />
      </button>
      <div className="policy__accordion-body">
        <p>{section.body}</p>
      </div>
    </div>
  );
}

export default function Policies() {
  const [activePolicy, setActivePolicy] = useState('shipping');
  const current = policies.find(p => p.id === activePolicy);

  return (
    <main className="policies page-enter">
      <div className="page-hero">
        <div className="page-hero__bg">
          <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=80" alt="Policies" />
          <div className="page-hero__overlay" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Legal</p>
          <h1 className="page-hero__title">Our Policies</h1>
        </div>
      </div>

      <div className="policies__body container">
        <div className="policies__layout">
          {/* Sidebar */}
          <aside className="policies__sidebar">
            {policies.map(p => (
              <button
                key={p.id}
                className={`policies__tab ${activePolicy === p.id ? 'policies__tab--active' : ''}`}
                onClick={() => setActivePolicy(p.id)}
              >
                <span className="policies__tab-icon">{p.icon}</span>
                <span>{p.title}</span>
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="policies__content" key={activePolicy}>
            <div className="policies__content-header">
              <p className="section-label">{current.icon} Policy</p>
              <h2 className="policies__title">{current.title}</h2>
              <div className="gold-line-left" style={{ margin: '16px 0 8px' }}></div>
              <p className="policies__updated">Last updated: January 2025</p>
            </div>

            <div className="policies__sections">
              {current.sections.map((s, i) => (
                <PolicyAccordion key={i} section={s} />
              ))}
            </div>

            <div className="policies__contact-note">
              <p>Have questions about our policies? <a href="/contact">Contact our team</a> and we'll be happy to assist.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
