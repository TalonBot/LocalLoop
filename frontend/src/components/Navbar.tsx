'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-green-700">
        <Link href="/">MyApp</Link>
      </div>
      <div className="space-x-4">
        <Link
          href="/product"
          className="px-4 py-2 text-green-700 hover:text-green-900 transition"
        >
        </Link>
        <Link
          href="/cart"
          className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
        >
          🛒 Cart
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
