import { SearchForm } from "@/features/search";
import popularRoutes from "@/data/popularRoutes.json";
import features from "@/data/features.json";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Video Banner Section */}
      <section className="relative w-full h-75 sm:h-87.5 lg:h-95 overflow-hidden flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://assets.sharetrip.net/hero-bg-cover.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Text content inside the video banner */}
        <div className="relative max-w-5xl mx-auto px-4 w-full z-10 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] leading-tight">
            Welcome to <span className="font-black text-white">FlyNext!</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/95 font-medium max-w-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            Find Flights, Hotels, Visa & Holidays
          </p>
        </div>
      </section>

      {/* Overlapping Search Form Container */}
      <section className="relative w-full px-4 -mt-20 sm:-mt-24 lg:-mt-28 mb-16">
        <div className="w-full max-w-5xl mx-auto">
          <SearchForm />
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
            Popular Routes
          </h2>
          <p className="mt-2 text-gray-500 text-center">
            Most searched flight routes this month
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes?.map((route) => (
              <div
                key={route.code}
                className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:border-blue-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{route.from}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {route.code}
                    </p>
                    <p className="text-sm text-gray-500">{route.to}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-primary-500">
                      {route.price}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl ring-2 ring-primary-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
            Why Choose FlyNext?
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features?.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <span className="text-4xl mb-4">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
