import Image from 'next/image';
import Link from 'next/link';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/' },
  { label: 'Bookings', href: '#' },
] as const;

const supportLinks = [
  { label: 'Help Center', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'FAQs', href: '#' },
] as const;

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
] as const;

type FooterLinkGroup = {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

const linkGroups: FooterLinkGroup[] = [
  { title: 'Quick Links', links: quickLinks },
  { title: 'Support', links: supportLinks },
  { title: 'Legal', links: legalLinks },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="FlyNext"
              width={120}
              height={36}
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Your trusted flight booking partner
            </p>
          </div>

          {/* Columns 2–4 — Link groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-500">
            &copy; 2026 FlyNext. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
