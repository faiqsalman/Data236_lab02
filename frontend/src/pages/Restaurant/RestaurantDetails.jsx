import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'

// ─────────────────────────────────────────────────────────────────────────────
// Mock data  (replaced by API call once backend is wired)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  id: 1,
  name: 'The Golden Fork',
  rating: 4.2,
  reviewCount: 342,
  claimed: true,
  price: '$$',
  cuisine: 'American, New American',
  isOpen: true,
  website: 'thegoldenfork.com',
  phone: '(213) 555-0147',
  todayHours: '11:00 AM – 10:00 PM',
  todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, // 0=Mon
  lastUpdated: '3 days',
  totalPhotos: 128,
  address: '1234 W Sunset Blvd, Los Angeles, CA 90026',
  city: 'Los Angeles',
  photos: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&q=80',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&q=80',
  ],
  updates: [
    { id: 1, date: 'June 2025',  title: 'New Summer Menu',    text: 'Check out our new summer menu featuring fresh seasonal ingredients and exciting new dishes from our executive chef.' },
    { id: 2, date: 'May 2025',   title: 'Extended Hours',     text: 'We are now open until midnight on Fridays and Saturdays. Come in for late-night dining and cocktails!' },
    { id: 3, date: 'April 2025', title: 'Private Dining Room',text: 'Book our beautiful private dining room for special events and gatherings of up to 20 guests.' },
  ],
  dishes: [
    { id: 1, name: 'Truffle Risotto',     photos: 24, reviews: 18, img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&q=80' },
    { id: 2, name: 'Wagyu Steak',         photos: 31, reviews: 27, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80' },
    { id: 3, name: 'Lobster Bisque',      photos: 15, reviews: 12, img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300&q=80' },
    { id: 4, name: 'Chocolate Lava Cake', photos: 19, reviews: 22, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&q=80' },
    { id: 5, name: 'Caesar Salad',        photos: 8,  reviews: 9,  img: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=300&q=80' },
  ],
  vibes: [
    { label: 'Inside',     totalPhotos: 48,  photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80'], tags: [{ label: 'Casual', icon: 'tshirt' }, { label: 'Dogs allowed', icon: 'dog' }] },
    { label: 'Outside',    totalPhotos: 32,  photos: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80'], tags: [{ label: 'Garden seating', icon: 'tree' }, { label: 'Outdoor dining', icon: 'sun' }] },
    { label: 'All photos', totalPhotos: 128, photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80'], tags: [{ label: 'Great ambiance', icon: 'sparkle' }, { label: 'Special occasions', icon: 'star' }] },
  ],
  highlights: [
    { label: 'Outdoor Seating',      icon: 'umbrella' },
    { label: 'Happy Hour Specials',  icon: 'drink' },
    { label: 'Pet Friendly',         icon: 'paw' },
    { label: 'Large Group Friendly', icon: 'people' },
    { label: 'Discounts Available',  icon: 'tag' },
    { label: 'Vegan Friendly',       icon: 'leaf' },
  ],
  peopleSearched: ['New American restaurants', 'Fine dining LA', 'Romantic restaurants', 'Business lunch', 'Sunday brunch', 'Date night restaurants'],
  hours: [
    { day: 'Mon', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Tue', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Wed', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Thu', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Fri', open: '11:00 AM', close: '12:00 AM' },
    { day: 'Sat', open: '10:00 AM', close: '12:00 AM' },
    { day: 'Sun', open: '10:00 AM', close: '9:00 PM' },
  ],
  amenities: [
    { label: 'Outdoor Seating',       icon: 'umbrella' },
    { label: 'Takes Reservations',    icon: 'calendar' },
    { label: 'Delivery',              icon: 'truck' },
    { label: 'Takeout',               icon: 'bag' },
    { label: 'Wi-Fi Available',       icon: 'wifi' },
    { label: 'Full Bar',              icon: 'wine' },
    { label: 'Wheelchair Accessible', icon: 'accessible' },
    { label: 'Parking Available',     icon: 'parking' },
    { label: 'Happy Hour',            icon: 'drink' },
    { label: 'Gender Neutral Restrooms', icon: 'restroom' },
    { label: 'Bike Parking',          icon: 'bike' },
    { label: 'Street Parking',        icon: 'car' },
  ],
  owner: { name: 'Michael C.', title: 'Business Owner' },
  ownerDescription: "The Golden Fork has been a cornerstone of LA's dining scene since 2010. We pride ourselves on using locally sourced, seasonal ingredients to craft dishes that tell a story. Our team of passionate chefs brings together culinary traditions from around the world to create a dining experience that is both familiar and exciting.",
  qas: [
    { id: 1, question: 'Do you offer a tasting menu?',   answer: 'Yes! We offer a 5-course tasting menu every Friday and Saturday evening for $95 per person with optional wine pairing.', user: 'Jennifer L.', title: 'Foodie',       timeAgo: '1 year ago' },
    { id: 2, question: 'Is parking available nearby?',   answer: 'There is a parking garage on 5th St, just a 2-minute walk from our entrance. Validated parking available with purchase.', user: 'Marcus T.',  title: 'Local Guide', timeAgo: '8 months ago' },
  ],
  totalQAs: 14,
  ratingBreakdown: { 5: 180, 4: 95, 3: 42, 2: 15, 1: 10 },
  reviews: [
    { id: 1, user: 'Jessica P.', location: 'Los Angeles, CA',   rating: 5, date: 'October 2024',   photoCount: 3, text: "An absolutely stunning dining experience from start to finish. The truffle risotto was perfectly creamy and the Wagyu steak was cooked to perfection. Service was attentive without being intrusive. Will be returning for every special occasion.", photo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', reactions: { helpful: 7,  thanks: 3, love: 12, ohno: 0 }, ownerResponse: 'Thank you so much for the kind words, Jessica! We look forward to welcoming you back soon. — Michael, Owner' },
    { id: 2, user: 'David K.',   location: 'Beverly Hills, CA', rating: 4, date: 'September 2024', photoCount: 1, text: "Excellent food and great ambiance. The lobster bisque was rich and flavorful. The only reason I'm giving 4 stars instead of 5 is because we waited 20 minutes past our reservation time. Otherwise, a fantastic evening.", photo: null, reactions: { helpful: 4, thanks: 1, love: 5, ohno: 2 }, ownerResponse: null },
    { id: 3, user: 'Sophia R.',  location: 'Santa Monica, CA',  rating: 5, date: 'August 2024',    photoCount: 5, text: "The best dining experience I've had in LA. The tasting menu is worth every penny. Each course was a work of art. The sommelier's wine pairings were spot on. The chocolate lava cake for dessert was the cherry on top.", photo: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', reactions: { helpful: 15, thanks: 8, love: 23, ohno: 0 }, ownerResponse: null },
    { id: 4, user: 'Ryan M.',    location: 'West Hollywood, CA',rating: 3, date: 'July 2024',      photoCount: 0, text: "Food was good but the prices are steep for the portion sizes. The atmosphere is nice and the staff was friendly. Just felt like we were paying for the ambiance more than the food itself. Might come back for happy hour.", photo: null, reactions: { helpful: 6, thanks: 2, love: 1, ohno: 3 }, ownerResponse: null },
    { id: 5, user: 'Amanda T.',  location: 'Culver City, CA',   rating: 5, date: 'June 2024',      photoCount: 2, text: "Celebrated my anniversary here and it was magical. The staff knew it was our anniversary and surprised us with a complimentary dessert. The Caesar salad tableside preparation was theatrical and delicious. A truly special place.", photo: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400&q=80', reactions: { helpful: 11, thanks: 5, love: 18, ohno: 0 }, ownerResponse: "Congratulations on your anniversary, Amanda! It was our pleasure to celebrate with you. We hope to see you again soon! — Michael, Owner" },
  ],
  notRecommendedCount: 23,
  totalReviewPages: 69,
  collections: [
    { id: 1, name: 'Best LA Date Night Spots',  user: 'Alexis M.',    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80' },
    { id: 2, name: 'Top Fine Dining 2024',       user: 'Trevor K.',    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80' },
    { id: 3, name: 'Anniversary Restaurants',    user: 'Sarah & Tom',  img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80' },
    { id: 4, name: 'LA Hidden Gems',             user: 'Foodie Maria', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80' },
    { id: 5, name: 'Business Lunch Spots',       user: 'Dan H.',       img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' },
  ],
  relatedBusinesses: [
    { id: 2, name: 'Craft & Kitchen',  rating: 4.1, reviews: 287,  price: '$$',  cuisine: 'American',    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80' },
    { id: 3, name: 'Marble & Rye',     rating: 4.4, reviews: 512,  price: '$$$', cuisine: 'New American', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80' },
    { id: 4, name: 'The Oak Room',     rating: 3.9, reviews: 198,  price: '$$',  cuisine: 'Gastropub',   img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' },
    { id: 5, name: 'Felix Trattoria',  rating: 4.6, reviews: 823,  price: '$$$', cuisine: 'Italian',     img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80' },
    { id: 6, name: 'Night + Market',   rating: 4.5, reviews: 1204, price: '$$',  cuisine: 'Thai',        img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared icon helpers
// ─────────────────────────────────────────────────────────────────────────────
const ChevL = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
const ChevR = <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>

function ArrowBtn({ onClick, dir, cls = '' }) {
  return (
    <button onClick={onClick} className={`w-9 h-9 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 shrink-0 ${cls}`}>
      {dir === 'l' ? ChevL : ChevR}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StarRating
// ─────────────────────────────────────────────────────────────────────────────
function StarRating({ rating, size = 'md', light = false }) {
  const sz = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }[size]
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sz} ${s <= Math.round(rating) ? 'fill-[#d32323]' : light ? 'fill-white/30' : 'fill-gray-200'}`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HScroller — horizontal scroll wrapper with arrows
// ─────────────────────────────────────────────────────────────────────────────
function HScroller({ children, cardWidth = 220 }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
  return (
    <div className="relative flex items-center gap-2">
      <ArrowBtn dir="l" onClick={() => scroll(-1)} />
      <div ref={ref} className="flex gap-4 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
      <ArrowBtn dir="r" onClick={() => scroll(1)} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight icon map
// ─────────────────────────────────────────────────────────────────────────────
const HIGHLIGHT_ICONS = {
  umbrella: <svg className="w-6 h-6 text-[#d32323]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>,
  drink:    <svg className="w-6 h-6 text-[#d32323]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 22h8M12 11v11M3 3l4 8h10l4-8H3z"/></svg>,
  paw:      <svg className="w-6 h-6 text-[#d32323]" fill="currentColor" viewBox="0 0 24 24"><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9" cy="5.5" r="2.5"/><circle cx="15" cy="5.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M12 13c-2.5 0-5.5 2.2-5.5 5.5 0 2 1.5 3 3 3h5c1.5 0 3-1 3-3 0-3.3-3-5.5-5.5-5.5z"/></svg>,
  people:   <svg className="w-6 h-6 text-[#d32323]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tag:      <svg className="w-6 h-6 text-[#d32323]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={3}/></svg>,
  leaf:     <svg className="w-6 h-6 text-[#d32323]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 0 0 4.66 21C8 19.5 18 17 21 8"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 22c3-3.5 5-6 9-8"/></svg>,
}

// Amenity icon map
const AMENITY_ICONS = {
  umbrella:   <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>,
  calendar:   <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  truck:      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  bag:        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  wifi:       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  wine:       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M8 22h8M12 11v11M6 2l1.5 7a4.5 4.5 0 0 0 9 0L18 2H6z"/></svg>,
  accessible: <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2h-6l-2-4H9l-2 6h4v5h6v-2h-4v-3h6z"/></svg>,
  parking:    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>,
  drink:      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 22h8M12 11v11M3 3l4 8h10l4-8H3z"/></svg>,
  restroom:   <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 8v6h2v8h4v-8h2V8H5zm10 0l-2 6h2v8h2v-8h2l-2-6h-2z"/></svg>,
  bike:       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-3l-2 6 3 3 2-2 3-2"/><circle cx="15" cy="5" r="1"/></svg>,
  car:        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
}

// Vibe tag icon map
const VIBE_ICONS = {
  tshirt:  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>,
  dog:     <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm15 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-8 4c-2.5 0-5.5 2.2-5.5 5.5 0 2 1.5 3 3 3h5c1.5 0 3-1 3-3C17 15.7 14 13.5 11.5 13.5z"/></svg>,
  tree:    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17 14l-5-8-5 8h3v7h4v-7h3z"/></svg>,
  sun:     <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  sparkle: <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 5h5l-4 3 1.5 5L12 12l-4 3 1.5-5-4-3h5z"/></svg>,
  star:    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
}

// Reaction icons
const REACTION_ICONS = {
  helpful: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6m-3-3v-4m0 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg>,
  thanks:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.5 2.5c.83 0 1.5.67 1.5 1.5v5l2-1c.83 0 1.5.67 1.5 1.5S20 11 20 11l-6 6c-1 1-2.5 1.5-4 1.5A5.5 5.5 0 0 1 4.5 13V8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V4c0-.83.67-1.5 1.5-1.5S10.5 3.17 10.5 4V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z"/></svg>,
  love:    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  ohno:    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3}/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3}/><path strokeLinecap="round" d="M17.5 7.5c.5-1.5 2-1.5 2-3"/></svg>,
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function SectionDivider() { return <hr className="border-gray-200 my-0" /> }

function SectionHeader({ left, right }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <p className="yelp-b1-bold text-gray-900">{left}</p>
      {right && <div className="yelp-b2 text-gray-500">{right}</div>}
    </div>
  )
}

function ReactionBtn({ type, label, count }) {
  const [active, setActive] = useState(false)
  return (
    <button onClick={() => setActive(!active)} className="flex flex-col items-center gap-1">
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-[#d32323] text-[#d32323] bg-red-50' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>
        {REACTION_ICONS[type]}
      </div>
      <span className="yelp-b3 text-gray-500">{label} {count > 0 ? count : ''}</span>
    </button>
  )
}

function WriteReviewTile({ businessName }) {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 mb-6">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setSelected(s)}
                className={`w-7 h-7 cursor-pointer transition-colors ${s <= (hover || selected) ? 'fill-[#d32323]' : 'fill-gray-200'}`} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="yelp-b2 text-gray-400">Select your rating</span>
        </div>
        <p className="yelp-b2 text-gray-500 mt-1">Start your review of {businessName}</p>
      </div>
    </div>
  )
}

function RatingBreakdown({ breakdown, total, rating }) {
  return (
    <div className="flex items-start gap-10 mb-6">
      {/* Left: breakdown bars */}
      <div className="flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] || 0
          const pct = Math.round((count / total) * 100)
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="yelp-b3 text-gray-600 w-2 shrink-0">{star}</span>
              <svg className="w-3 h-3 fill-[#d32323] shrink-0" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#d32323] rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="yelp-b3 text-gray-400 w-6 shrink-0">{count}</span>
            </div>
          )
        })}
      </div>
      {/* Right: overall */}
      <div>
        <p className="yelp-b1-bold text-gray-900 mb-1">Overall rating</p>
        <StarRating rating={rating} size="md" />
        <p className="yelp-b3 text-gray-500 mt-1">{total} reviews</p>
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="py-6 border-b border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
        </div>
        <div>
          <p className="yelp-b2-semi text-gray-900">{review.user}</p>
          <p className="yelp-b3 text-gray-500">{review.location}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <StarRating rating={review.rating} size="sm" />
        <span className="yelp-b3 text-gray-500">{review.date}</span>
      </div>

      {review.photoCount > 0 && (
        <div className="flex items-center gap-1 yelp-b3 text-gray-500 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {review.photoCount} photo{review.photoCount > 1 ? 's' : ''}
        </div>
      )}

      <p className="yelp-b2 text-gray-700 leading-relaxed mb-3">{review.text}</p>

      {review.photo && (
        <div className="w-40 h-32 rounded-lg overflow-hidden mb-3">
          <img src={review.photo} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-6 mb-3">
        {[['helpful', 'Helpful', review.reactions.helpful], ['thanks', 'Thanks', review.reactions.thanks], ['love', 'Love this', review.reactions.love], ['ohno', 'Oh no', review.reactions.ohno]].map(([type, label, count]) => (
          <ReactionBtn key={type} type={type} label={label} count={count} />
        ))}
      </div>

      {review.ownerResponse && (
        <div className="border-l-2 border-gray-300 pl-4 mt-2">
          <p className="yelp-b3-semi text-gray-700 mb-0.5">Response from the owner</p>
          <p className="yelp-b2 text-gray-600 italic">{review.ownerResponse}</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function RestaurantDetails() {
  useParams()
  const r = MOCK

  // Photo strip
  const [photoIdx,     setPhotoIdx]     = useState(0)
  const [updateIdx,    setUpdateIdx]    = useState(0)
  const [recommend,    setRecommend]    = useState(null)
  const [saved,        setSaved]        = useState(false)
  // Vibe photos
  const [vibeIdx,      setVibeIdx]      = useState({ 0: 0, 1: 0, 2: 0 })
  // About
  const [readMore,     setReadMore]     = useState(false)
  // Reviews
  const [sortOrder,    setSortOrder]    = useState('Newest First')
  const [filterRating, setFilterRating] = useState('All ratings')
  const [reviewSearch, setReviewSearch] = useState('')
  const [reviewPage,   setReviewPage]   = useState(1)
  const [showNotRec,   setShowNotRec]   = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [resvDate,         setResvDate]         = useState(new Date().toISOString().split('T')[0])
  const [resvTime,         setResvTime]         = useState('7:00 PM')
  const [resvParty,        setResvParty]        = useState('2')

  const prevPhoto  = () => setPhotoIdx((i) => (i - 1 + r.photos.length) % r.photos.length)
  const nextPhoto  = () => setPhotoIdx((i) => (i + 1) % r.photos.length)
  const prevUpdate = () => setUpdateIdx((i) => (i - 1 + r.updates.length) % r.updates.length)
  const nextUpdate = () => setUpdateIdx((i) => (i + 1) % r.updates.length)

  const visibleAmenities = showAllAmenities ? r.amenities : r.amenities.slice(0, 8)
  const REVIEWS_PER_PAGE = 3
  const totalPages = Math.ceil(r.reviews.length / REVIEWS_PER_PAGE)
  const visibleReviews = r.reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)

  return (
    <div className="min-h-screen bg-white">
      <PageHeader variant="light" />

      {/* ── PHOTO STRIP ──────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[65vh] overflow-hidden">
        {r.photos.map((p, i) => (
          <div key={i} className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: `url(${p})`, opacity: i === photoIdx ? 1 : 0 }} />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 45%, transparent 65%)' }} />

        <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-10">{ChevL}</button>
        <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-10">{ChevR}</button>

        <div className="absolute bottom-0 left-0 right-0 px-36 pb-8 text-white z-10">
          <h1 className="yelp-h1 mb-2 drop-shadow-lg">{r.name}</h1>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={r.rating} light />
            <span className="yelp-b1-semi">{r.rating}</span>
            <span className="yelp-b1 text-white/80">({r.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-2 yelp-b2 text-white/90 mb-3">
            {r.claimed && <><span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Claimed</span><span className="text-white/40">·</span></>}
            <span>{r.price}</span><span className="text-white/40">·</span><span>{r.cuisine}</span>
          </div>
          <div className="flex items-center gap-3 yelp-b2 flex-wrap">
            <span className={r.isOpen ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{r.isOpen ? 'Open' : 'Closed'}</span>
            <span className="text-white/80">{r.todayHours}</span>
            <button className="text-white/80 hover:text-white underline">See hours</button>
            <span className="text-white/40">·</span>
            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>
            <span className="text-white/70">Updated {r.lastUpdated} ago</span>
          </div>
        </div>
        <button className="absolute bottom-8 right-8 bg-white/20 hover:bg-white/30 backdrop-blur text-white yelp-b2-semi px-4 py-2 rounded-lg border border-white/40 z-10">
          See all {r.totalPhotos} photos
        </button>
      </div>

      {/* ── TWO-COLUMN LAYOUT (action buttons → recommended reviews) ─────────── */}
      <div className="flex items-start gap-8 px-36">

        {/* LEFT COLUMN ⅔ */}
        <div className="flex-[2] min-w-0">

          {/* ── ACTION BUTTONS ─────────────────────────────────────────────── */}
          <div className="py-5 flex items-center gap-3 border-b border-gray-200">
        {[
          { red: true,  icon: <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, label: 'Write a review' },
          { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, label: 'Add photos/videos' },
          { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>, label: 'Share' },
          { icon: <svg className={`w-4 h-4 ${saved ? 'fill-[#d32323]' : 'fill-none stroke-current'}`} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label: saved ? 'Saved' : 'Save', onClick: () => setSaved(!saved), active: saved },
          { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>, label: 'Follow' },
        ].map(({ red, icon, label, onClick, active }) => (
          <button key={label} onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2 rounded-full yelp-b2-semi transition-colors ${
              red    ? 'bg-[#d32323] text-white hover:bg-red-700' :
              active ? 'bg-red-50 text-[#d32323] border-2 border-[#d32323]' :
                       'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

          {/* ── DO YOU RECOMMEND? ──────────────────────────────────────────── */}
          <div className="py-6 border-b border-gray-200">
        <p className="yelp-b1-bold text-gray-900 mb-4">Do you recommend {r.name}?</p>
        <div className="flex gap-3">
          {['yes', 'no', 'maybe'].map((opt) => (
            <button key={opt} onClick={() => setRecommend(opt)}
              className={`px-8 py-2 rounded-full yelp-b2-semi border-2 capitalize transition-colors ${recommend === opt ? 'border-[#d32323] bg-[#d32323] text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

          {/* ── UPDATES FROM THIS BUSINESS ─────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="Updates From This Business" />
        <div className="flex items-center gap-4">
          <ArrowBtn dir="l" onClick={prevUpdate} />
          <div className="border border-gray-200 rounded-xl p-5 max-w-lg flex-1">
            <p className="yelp-b3 text-gray-400 mb-1">{r.updates[updateIdx].date}</p>
            <p className="yelp-b1-bold text-gray-900 mb-2">{r.updates[updateIdx].title}</p>
            <p className="yelp-b2 text-gray-600 leading-relaxed">{r.updates[updateIdx].text}</p>
          </div>
          <ArrowBtn dir="r" onClick={nextUpdate} />
        </div>
        <div className="flex gap-2 mt-4 ml-11">
          {r.updates.map((_, i) => (
            <button key={i} onClick={() => setUpdateIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === updateIdx ? 'bg-[#d32323]' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

          {/* ── MENU / POPULAR DISHES ──────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="Menu" />
        <SectionHeader
          left="Popular Dishes"
          right={<button className="flex items-center gap-1 hover:underline">View full menu <span>›</span></button>}
        />
        <HScroller cardWidth={210}>
          {r.dishes.map((dish) => (
            <div key={dish.id} className="w-48 shrink-0 cursor-pointer">
              <div className="w-full h-48 rounded-lg overflow-hidden mb-2">
                <img src={dish.img} alt={dish.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="yelp-b2-semi text-gray-900 truncate">{dish.name}</p>
              <p className="yelp-b3 text-gray-500">{dish.photos} Photos · {dish.reviews} Reviews</p>
            </div>
          ))}
        </HScroller>
        <button className="mt-5 px-5 py-2 rounded-full border border-gray-300 text-gray-700 yelp-b2 hover:bg-gray-50">
          Website Menu
        </button>
      </div>

          {/* ── WHAT'S THE VIBE? ───────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="What's the vibe?" />
        <div className="grid grid-cols-3 gap-4">
          {r.vibes.map((vibe, vi) => (
            <div key={vibe.label} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="relative h-44">
                <img src={vibe.photos[vibeIdx[vi] || 0]} alt={vibe.label} className="w-full h-full object-cover" />
                <button onClick={() => setVibeIdx((p) => ({ ...p, [vi]: (((p[vi] || 0) - 1) + vibe.photos.length) % vibe.photos.length }))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">‹</button>
                <button onClick={() => setVibeIdx((p) => ({ ...p, [vi]: ((p[vi] || 0) + 1) % vibe.photos.length }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">›</button>
              </div>
              <div className="p-3">
                <p className="yelp-b2-semi text-gray-900 mb-1">{vibe.label}</p>
                <p className="yelp-b3 text-gray-500 mb-2">{vibe.totalPhotos} photos</p>
                {vibe.tags.map((tag) => (
                  <div key={tag.label} className="flex items-center gap-1.5 mb-1">
                    <span className="text-gray-400">{VIBE_ICONS[tag.icon]}</span>
                    <span className="yelp-b3 text-gray-600">{tag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* ── HIGHLIGHTS ─────────────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <p className="yelp-b1-bold text-gray-900">Highlights from the business</p>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
        <div className="flex flex-wrap gap-4">
          {r.highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              {HIGHLIGHT_ICONS[h.icon]}
              <span className="yelp-b2 text-gray-700">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

          {/* ── PEOPLE ALSO SEARCHED FOR ───────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="People also searched for" />
        <div className="flex flex-wrap gap-3">
          {r.peopleSearched.map((term) => (
            <button key={term} className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 yelp-b2 text-gray-700 bg-white hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
              {term}
            </button>
          ))}
        </div>
      </div>

          {/* ── LOCATION & HOURS ───────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <p className="yelp-b1-bold text-gray-900">Location &amp; Hours</p>
          <button className="flex items-center gap-1 yelp-b3 text-gray-500 hover:text-gray-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Suggest an edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {/* Map placeholder + address */}
          <div>
            <div className="w-full h-44 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden border border-gray-200">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }} />
              <svg className="w-10 h-10 fill-[#d32323] relative z-10 drop-shadow" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <p className="yelp-b2 text-gray-700 mb-2">{r.address}</p>
            <button className="px-4 py-2 border border-gray-300 rounded-full yelp-b2 text-gray-700 hover:bg-gray-50">Get Directions</button>
          </div>
          {/* Hours */}
          <div>
            <table className="w-full">
              <tbody>
                {r.hours.map((h, i) => (
                  <tr key={h.day} className={i === r.todayIndex ? 'font-semibold' : ''}>
                    <td className="yelp-b2 text-gray-700 py-1 pr-4 w-12">{h.day}</td>
                    <td className="yelp-b2 text-gray-700 py-1">{h.open} – {h.close}</td>
                    {i === r.todayIndex && (
                      <td className="pl-3">
                        <span className={`yelp-b3 px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.isOpen ? 'Open now' : 'Closed now'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

          {/* ── AMENITIES AND MORE ─────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="Amenities and More" />
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          {visibleAmenities.map((a) => (
            <div key={a.label} className="flex items-center gap-3">
              {AMENITY_ICONS[a.icon] || <div className="w-5 h-5" />}
              <span className="yelp-b2 text-gray-700">{a.label}</span>
            </div>
          ))}
        </div>
        {!showAllAmenities && r.amenities.length > 8 && (
          <button onClick={() => setShowAllAmenities(true)} className="mt-4 px-5 py-2 border border-gray-300 rounded-full yelp-b2 text-gray-700 hover:bg-gray-50">
            {r.amenities.length - 8} More Attributes
          </button>
        )}
      </div>

          {/* ── ABOUT THE BUSINESS ─────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="About the Business" />
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <div>
            <p className="yelp-b2-semi text-gray-900">{r.owner.name}</p>
            <p className="yelp-b3 text-gray-500">{r.owner.title}</p>
          </div>
        </div>
        <p className={`yelp-b2 text-gray-700 leading-relaxed ${readMore ? '' : 'line-clamp-3'}`}>{r.ownerDescription}</p>
        {!readMore && (
          <button onClick={() => setReadMore(true)} className="mt-2 px-4 py-1.5 border border-gray-300 rounded-full yelp-b2 text-gray-700 hover:bg-gray-50">
            Read more
          </button>
        )}
      </div>

          {/* ── ASK THE COMMUNITY ──────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader
          left="Ask the Community"
          right={<button className="flex items-center gap-1 text-[#d32323] hover:underline yelp-b2-semi">Ask a question +</button>}
        />
        <div className="flex flex-col gap-4">
          {r.qas.map((qa) => (
            <div key={qa.id} className="border border-gray-200 rounded-xl p-4">
              <p className="yelp-b2 text-gray-900 mb-2"><span className="font-bold">Q:</span> {qa.question}</p>
              <div className="flex items-start justify-between gap-4">
                <p className="yelp-b2 text-gray-700"><span className="font-bold">A:</span> {qa.answer}</p>
                <div className="shrink-0 text-right">
                  <p className="yelp-b3-semi text-gray-700">{qa.user}</p>
                  <p className="yelp-b3 text-gray-500">{qa.title}</p>
                  <p className="yelp-b3 text-gray-400">{qa.timeAgo}</p>
                </div>
              </div>
              <button className="mt-3 px-4 py-1.5 border border-gray-300 rounded-full yelp-b3 text-gray-600 hover:bg-gray-50">See question details</button>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2.5 border border-gray-300 rounded-full yelp-b2 text-gray-700 hover:bg-gray-50">
          See all {r.totalQAs} questions
        </button>
      </div>

          {/* ── RECOMMENDED REVIEWS ────────────────────────────────────────── */}
          <div className="py-8 border-b border-gray-200">
        <SectionHeader left="Recommended Reviews" />
        <WriteReviewTile businessName={r.name} />
        <RatingBreakdown breakdown={r.ratingBreakdown} total={r.reviewCount} rating={r.rating} />

        {/* Sort / Filter / Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 yelp-b2 text-gray-700 bg-white cursor-pointer focus:outline-none">
            {['Newest First', 'Oldest First', 'Highest Rated', 'Lowest Rated', 'Elites'].map((o) => <option key={o}>{o}</option>)}
          </select>
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 yelp-b2 text-gray-700 bg-white cursor-pointer focus:outline-none">
            {['All ratings', '5 stars', '4 stars', '3 stars', '2 stars', '1 star'].map((o) => <option key={o}>{o}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden">
            <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Search reviews"
              className="px-4 py-2 yelp-b2 text-gray-700 focus:outline-none w-52" />
            <button className="px-3 py-2 bg-gray-100 border-l border-gray-300 text-gray-500 hover:bg-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            </button>
          </div>
        </div>

        {/* Review list */}
        <div>{visibleReviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)}</div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-1">
            <button onClick={() => setReviewPage((p) => Math.max(1, p - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setReviewPage(n)} className={`w-8 h-8 rounded-full flex items-center justify-center yelp-b2 transition-colors ${n === reviewPage ? 'bg-[#d32323] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{n}</button>
            ))}
            <button onClick={() => setReviewPage((p) => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600">›</button>
          </div>
          <span className="yelp-b2 text-gray-500">{reviewPage} of {r.totalReviewPages}</span>
        </div>

        {/* Not recommended */}
          <button onClick={() => setShowNotRec(!showNotRec)} className="mt-6 flex items-center gap-2 yelp-b2 text-gray-500 hover:text-gray-700">
            {r.notRecommendedCount} other reviews that are not currently recommended
            <svg className={`w-4 h-4 transition-transform ${showNotRec ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          </div>

        </div>{/* end left column */}

        {/* ── RIGHT COLUMN ⅓ — sticky sidebar ─────────────────────────────── */}
        <div className="w-80 shrink-0 sticky top-4 mt-5 flex flex-col gap-4">

          {/* Tile 1: Make a Reservation */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
            <p className="yelp-b2-bold text-gray-900 mb-4">Make a Reservation</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="yelp-b3 text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={resvDate}
                  onChange={(e) => setResvDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 focus:outline-none focus:border-[#d32323]"
                />
              </div>
              <div>
                <label className="yelp-b3 text-gray-500 mb-1 block">Time</label>
                <select
                  value={resvTime}
                  onChange={(e) => setResvTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 bg-white focus:outline-none focus:border-[#d32323]"
                >
                  {['5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="yelp-b3 text-gray-500 mb-1 block">Party size</label>
                <select
                  value={resvParty}
                  onChange={(e) => setResvParty(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 bg-white focus:outline-none focus:border-[#d32323]"
                >
                  {Array.from({ length: 19 }, (_, i) => String(i + 2)).map((n) => (
                    <option key={n}>{n} people</option>
                  ))}
                </select>
              </div>
              <button className="w-full bg-[#d32323] text-white yelp-b3-bold py-3 rounded-full hover:bg-red-700 transition-colors mt-1">
                Find a Table
              </button>
            </div>
          </div>

          {/* Tile 2: Order Takeout or Delivery */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
            <p className="yelp-b2-bold text-gray-900 mb-4">Order Takeout or Delivery</p>
            <button className="w-full bg-[#d32323] text-white yelp-b3-bold py-3 rounded-full hover:bg-red-700 transition-colors">
              Start Order
            </button>
          </div>

          {/* Tile 3: Business Info */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Website */}
            <div className="flex items-center justify-between px-5 py-4">
              <a href={`https://${r.website}`} target="_blank" rel="noreferrer"
                className="yelp-b3 text-blue-600 hover:underline truncate">{r.website}</a>
              <button className="ml-3 shrink-0 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </button>
            </div>
            <hr className="border-gray-200" />
            {/* Phone */}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="yelp-b3 text-gray-800">{r.phone}</span>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <hr className="border-gray-200" />
            {/* Get Directions */}
            <div className="flex items-start justify-between px-5 py-4">
              <div>
                <button className="yelp-b3 text-blue-600 hover:underline block mb-1">Get Directions</button>
                <p className="yelp-b4 text-gray-500 leading-snug">{r.address}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1 ml-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
            </div>
            <hr className="border-gray-200" />
            {/* Message */}
            <div className="flex items-center justify-between px-5 py-4">
              <button className="yelp-b3 text-blue-600 hover:underline">Message the Business</button>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <hr className="border-gray-200" />
            {/* Suggest an edit */}
            <div className="px-5 py-4">
              <button className="flex items-center gap-2 yelp-b3 text-gray-600 hover:text-gray-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Suggest an Edit
              </button>
            </div>
          </div>

        </div>{/* end right column */}

      </div>{/* end two-column layout */}

      {/* ── COLLECTIONS ──────────────────────────────────────────────────────── */}
      <div className="px-36 py-8 border-b border-gray-200">
        <SectionHeader left={`Collections Including ${r.name}`} />
        <HScroller cardWidth={210}>
          {r.collections.map((col) => (
            <div key={col.id} className="w-48 shrink-0 cursor-pointer">
              <div className="w-full h-36 rounded-lg overflow-hidden mb-2">
                <img src={col.img} alt={col.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="yelp-b2-semi text-gray-900 truncate">{col.name}</p>
              <p className="yelp-b3 text-gray-500">By {col.user}</p>
            </div>
          ))}
        </HScroller>
      </div>

      {/* ── THREE-COLUMN SECTION ─────────────────────────────────────────────── */}
      <div className="px-36 py-8 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <p className="yelp-b1-bold text-gray-900 mb-1">Best of {r.city}</p>
            <p className="yelp-b2 text-gray-500 mb-4">Things to do in {r.city}</p>
            <p className="yelp-b2 text-gray-700 mb-2">People found <span className="font-semibold">{r.name}</span> by searching for…</p>
            {['new american · los angeles', 'fine dining · los angeles', 'upscale restaurants · los angeles', 'romantic dinner · los angeles'].map((s) => (
              <p key={s} className="yelp-b2 text-gray-500 mb-1">{s}</p>
            ))}
          </div>
          {/* Column 2 */}
          <div>
            <p className="yelp-b1-bold text-gray-900 mb-3">Browse Nearby</p>
            {['New American', 'Fine Dining', 'Steakhouses', 'Italian', 'Gastropubs'].map((cat) => (
              <p key={cat} className="yelp-b2 text-gray-500 mb-1">BEST of {r.city} {cat} near {r.name}</p>
            ))}
            <p className="yelp-b1-bold text-gray-900 mt-4 mb-3">Trending Searches in {r.city}</p>
            {['Best tacos', 'Happy hour deals', 'Rooftop bars', 'Brunch spots'].map((s) => (
              <p key={s} className="yelp-b2 text-gray-500 mb-1">{s} near {r.name}</p>
            ))}
          </div>
          {/* Column 3 */}
          <div>
            <p className="yelp-b1-bold text-gray-900 mb-3">Other Places Nearby</p>
            {['American', 'New American', 'Gastropub', 'Italian', 'Wine Bars'].map((cat) => (
              <p key={cat} className="yelp-b2 text-gray-500 mb-1">Find More {cat} near {r.name}</p>
            ))}
            <p className="yelp-b1-bold text-gray-900 mt-4 mb-3">Related Searches in {r.city}</p>
            {['Best restaurants', 'Outdoor dining', 'Late night food', 'Upscale dining'].map((s) => (
              <p key={s} className="yelp-b2 text-gray-500 mb-1">{s} in {r.city}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ── PEOPLE ALSO VIEWED ───────────────────────────────────────────────── */}
      <div className="px-36 py-8 border-b border-gray-200">
        <SectionHeader left="People Also Viewed" />
        <HScroller cardWidth={210}>
          {r.relatedBusinesses.map((biz) => (
            <div key={biz.id} className="w-48 shrink-0 cursor-pointer">
              <div className="w-full h-36 rounded-lg overflow-hidden mb-2">
                <img src={biz.img} alt={biz.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="yelp-b2-semi text-gray-900 truncate">{biz.name}</p>
              <div className="flex items-center gap-1 my-0.5">
                <StarRating rating={biz.rating} size="sm" />
                <span className="yelp-b3 text-gray-500">{biz.reviews}</span>
              </div>
              <p className="yelp-b3 text-gray-500">{biz.price} · {biz.cuisine}</p>
            </div>
          ))}
        </HScroller>
      </div>

      <Footer />
    </div>
  )
}
