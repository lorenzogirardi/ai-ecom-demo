import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary-600">
              E-commerce Demo
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              A production-ready e-commerce application built with Next.js,
              Fastify, and deployed on AWS EKS. Demonstrating modern cloud-native
              architecture patterns.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://github.com/lorenzogirardi/ai-ecom-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/products?featured=true"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sale=true"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  On Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/docs"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/lorenzogirardi/ai-ecom-demo/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} E-commerce Demo. Built for AWS EKS deployment.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
