'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-green-700">🌱 LocalLoop</div>
      <div className="space-x-4">
        <Link href="/" className="text-gray-700 hover:text-green-600">Home</Link>
        <Link href="/marketplace" className="text-gray-700 hover:text-green-600">Marketplace</Link>
        <Link href="/map" className="text-gray-700 hover:text-green-600">Map</Link>
        <Link href="/profile" className="text-gray-700 hover:text-green-600">Profile</Link>
      </div>
    </nav>
  );
}
