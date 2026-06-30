'use client'

import { Briefcase, Home, Trophy, Heart, Building, Sparkles } from 'lucide-react'

const AUDIENCES = [
  {
    icon: Briefcase,
    title: 'Working Professionals',
    desc: 'No time for grocery runs? Get ready-to-eat curated fruits delivered on autopilot to maintain your healthy routine.',
    color: 'bg-blue-500/10 text-blue-600',
    tag: 'Quick Nutrition'
  },
  {
    icon: Home,
    title: 'Families',
    desc: 'Keep your kids and family members healthy. Our larger boxes ensure there are always fresh fruits for everyone.',
    color: 'bg-green-500/10 text-[#22c55e]',
    tag: 'Daily Health'
  },
  {
    icon: Trophy,
    title: 'Gym Enthusiasts',
    desc: 'Power your workouts and recovery with high-potassium, protein-rich fruits designed for active lifestyles.',
    color: 'bg-orange-500/10 text-orange',
    tag: 'Fitness Fuel'
  },
  {
    icon: Heart,
    title: 'Senior Citizens',
    desc: 'Hassle-free doorstep delivery of soft, nutritious, and diabetic-friendly fruits vetted for senior health care.',
    color: 'bg-red-500/10 text-red-500',
    tag: 'Easy Digestion'
  },
  {
    icon: Building,
    title: 'Corporate Offices',
    desc: 'Foster a healthy, high-energy workspace. Curated morning dabbas filled with premium fresh seasonal fruits.',
    color: 'bg-purple-500/10 text-purple-600',
    tag: 'Office Perk'
  }
]

export default function WhoIsItFor() {
  return (
    <section id="why-us" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-[#f4fbf7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center mb-12">
          <span className="inline-flex items-center rounded-full bg-[#22c55e]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#22c55e]">
            Who is it for?
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
            Designed for <span className="text-[#22c55e]">Everyone</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mt-2">
            No matter your lifestyle or goals, FruitDabba brings the perfect fruit assortment directly to you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 justify-center">
          {AUDIENCES.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="fd-reveal h-full">
                <div className="card p-6 bg-white border border-gray-100 hover:border-[#22c55e]/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.color} mb-5`}>
                      {item.tag}
                    </span>
                    <span className={`flex w-12 h-12 items-center justify-center rounded-2xl ${item.color} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon size={24} />
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-base mb-3 leading-tight group-hover:text-forest transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[10px] font-bold text-forest opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <Sparkles size={10} className="text-orange" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
