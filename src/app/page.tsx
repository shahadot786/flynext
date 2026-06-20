export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 sm:py-28 lg:py-36 bg-linear-to-br from-primary-50 via-white to-primary-50/30">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Find Your <span className="text-primary-500">Next Flight</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto">
            Search 50+ routes across top airlines. Compare prices, filter
            results, and book in minutes.
          </p>
        </div>

        {/* Search Form Placeholder — will be replaced in PR 2 */}
        <div className="mt-10 w-full max-w-4xl mx-auto rounded-2xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-12 rounded-lg bg-gray-100 animate-skeleton" />
            <div className="h-12 rounded-lg bg-gray-100 animate-skeleton" />
            <div className="h-12 rounded-lg bg-gray-100 animate-skeleton" />
            <div className="h-12 rounded-lg bg-primary-500/20 animate-skeleton" />
          </div>
          <p className="mt-4 text-sm text-gray-400 text-center">
            Search form coming in PR 2
          </p>
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
            {[
              {
                from: "Dhaka",
                to: "Dubai",
                code: "DAC → DXB",
                price: "৳32,500",
              },
              {
                from: "Dhaka",
                to: "Doha",
                code: "DAC → DOH",
                price: "৳38,000",
              },
              {
                from: "Dhaka",
                to: "Singapore",
                code: "DAC → SIN",
                price: "৳28,000",
              },
            ].map((route) => (
              <div
                key={route.code}
                className="group relative rounded-xl border border-gray-200 p-6 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/30 transition-all duration-300 cursor-pointer"
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
            {[
              {
                icon: "✈️",
                title: "Best Prices",
                desc: "Compare fares across top airlines and find the lowest prices for your route.",
              },
              {
                icon: "⚡",
                title: "Instant Booking",
                desc: "Book your flight in under 2 minutes with our streamlined booking flow.",
              },
              {
                icon: "🛡️",
                title: "Secure Payment",
                desc: "Your payment information is protected with industry-standard encryption.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm"
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
