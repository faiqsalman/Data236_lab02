const FOOTER_COLUMNS = [
  {
    title: 'About',
    links: ['About Yelp', 'Careers', 'Press', 'Investor Relations', 'Trust & Safety', 'Content Guidelines', 'Accessibility Statement', 'Terms of Service', 'Privacy Policy', 'Ad Choices', 'Your Privacy Choices'],
  },
  {
    title: 'Discover',
    links: ['Yelp Project Cost Guides', 'Collections', 'Talk', 'Events', 'The Local Yelp', 'Official Yelp Blog', 'Support', 'Yelp Mobile'],
  },
  {
    title: 'Yelp for Business',
    links: ['Claim your Business Page', 'Advertise on Yelp', 'Yelp for Restaurant Owners', 'Table Management', 'Business Success Stories', 'Business Support', 'Yelp Blog for Business'],
  },
  {
    title: 'RepairPal',
    links: ['RepairPal', 'Car Makes', 'Car Repair Estimates'],
  },
  {
    title: 'Languages',
    links: ['English', 'العربية', 'Čeština', 'Dansk', 'Deutsch', 'Español (España)', 'Español (Latinoamérica)', 'Suomi', 'Filipino', 'Français', 'Magyar', 'Italiano', '日本語', '한국어', 'Bahasa Melayu', 'Nederlands', 'Norsk', 'Polski', 'Português', 'Română', 'Русский', 'Svenska', '中文 (简体)', '中文 (繁體)', 'Türkçe'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-100 px-36 py-12">
      <div className="grid grid-cols-5 gap-8">
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="yelp-b1-bold text-gray-900 mb-3">{col.title}</p>
            <ul className="flex flex-col gap-1.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="yelp-b2 text-gray-500 hover:text-gray-800 hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
