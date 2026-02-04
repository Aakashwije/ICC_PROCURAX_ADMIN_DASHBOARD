import Link from 'next/link';
import Image from "next/image";
import { LogIn } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-xl">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden border-2 border-blue-400">
            <Image
              src="/icc_logo.jpg"
              alt="ICC Logo"
              width={90}
              height={90}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ICC Procurax Admin Dashboard
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Manage project managers and control mobile app access
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <LogIn size={24} />
          Log in to the Admin Dashboard
        </Link>

        <p className="text-slate-400 text-sm mt-8">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
