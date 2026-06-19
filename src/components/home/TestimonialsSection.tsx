import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: '👩',
    rating: 5,
    text: 'FruitDabba has completely changed how I eat! The fruits are always so fresh and the delivery is on time. My kids love the exotic fruit selections!',
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    avatar: '👨',
    rating: 5,
    text: 'The monthly subscription is a steal. I\'m saving so much compared to buying from the market, and the quality is 10x better. Highly recommend!',
  },
  {
    name: 'Anjali Nair',
    location: 'Bangalore',
    avatar: '👩‍🦱',
    rating: 5,
    text: 'I\'ve tried 3 other fruit delivery services. FruitDabba is the best — the packaging is gorgeous, fruits arrive perfect every single time.',
  },
  {
    name: 'Vikram Singh',
    location: 'Pune',
    avatar: '🧑',
    rating: 5,
    text: 'As a fitness enthusiast, fresh fruits are non-negotiable. FruitDabba\'s daily delivery plan means I always have fresh fuel for my workouts.',
  },
  {
    name: 'Meera Patel',
    location: 'Ahmedabad',
    avatar: '👩‍🦳',
    rating: 5,
    text: 'The WhatsApp updates are so helpful! I know exactly when my delivery is coming. Customer service is also super responsive.',
  },
  {
    name: 'Arjun Reddy',
    location: 'Hyderabad',
    avatar: '👨‍🦱',
    rating: 5,
    text: 'Ordered for the first time last month and already on my third subscription. The Alphonso mangoes are absolutely divine. Worth every rupee!',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-forest-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-orange uppercase tracking-widest">Happy Customers</span>
          <h2 className="section-heading mt-3 text-white">
            People Love <span className="text-orange">FruitDabba</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex mb-4">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className="fill-orange text-orange" />
                ))}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 mb-6">Join 10,000+ happy customers getting fresh fruits every day.</p>
          <a
            href="/subscriptions"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-400 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
          >
            Start Your Subscription 🍊
          </a>
        </div>
      </div>
    </section>
  )
}
