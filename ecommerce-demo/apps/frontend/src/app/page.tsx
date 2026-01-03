import Link from "next/link";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern E-commerce
            <span className="gradient-text block">Demo Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A production-ready e-commerce application built with Next.js,
            Fastify, and deployed on AWS EKS. Explore the features and
            architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
            <a href="/api/docs" className="btn btn-outline btn-lg">
              View Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ShoppingBag className="w-8 h-8" />}
              title="Product Catalog"
              description="Browse products with categories, search, and filtering capabilities."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="Order Management"
              description="Complete order workflow from cart to checkout to delivery tracking."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="User Authentication"
              description="Secure JWT-based authentication with registration and login."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Scalable Architecture"
              description="Built for scale with Kubernetes, Redis caching, and CDN."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tech Stack
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TechCard
              title="Frontend"
              items={["Next.js 16", "TypeScript", "Tailwind CSS", "React Query"]}
            />
            <TechCard
              title="Backend"
              items={["Node.js 20", "Fastify", "Prisma", "PostgreSQL", "Redis"]}
            />
            <TechCard
              title="Infrastructure"
              items={["AWS EKS", "Terraform", "Helm", "GitHub Actions"]}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 text-center hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TechCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
