import { ClipboardList, Package, Truck, Sparkles } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Choose Subscription Plan',
    description: 'Select from Weekly, Monthly, or Quarterly curated box frequencies.',
  },
  {
    step: '02',
    icon: Package,
    title: 'Customize Your Fruit Preferences',
    description: 'Tell us which fruits you like or dislike. We pack exactly what you want.',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Receive Fresh Deliveries',
    description: 'Get handpicked, farm-fresh fruit boxes delivered straight to your door.',
  },
  {
    step: '04',
    icon: Sparkles,
    title: 'Pause or Modify Anytime',
    description: 'Going on vacation? Pause, skip, or change your fruits easily from your dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mx-auto items-center text-center max-w-2xl mb-16">
          <span className="inline-flex items-center rounded-full bg-forest/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
            How It Works
          </span>
          <h2 className="text-balance text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Fresh fruit in four simple steps
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-gray-500">
            From picking your plan to enjoying healthy living, we’ve made the whole experience effortless.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-forest/20 via-forest to-orange/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={i}
                  className="group relative h-full rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-lg"
                >
                  <span className="absolute right-5 top-5 font-bold text-4xl text-gray-100 group-hover:text-forest/10 transition-colors">
                    {step.step}
                  </span>
                  <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-white mb-5">
                    <Icon size={24} />
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

