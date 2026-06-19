export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import QualityPromise from '@/components/home/QualityPromise'
import SubscriptionCTA from '@/components/home/SubscriptionCTA'
import SubscriptionCategoriesSection from '@/components/home/SubscriptionCategoriesSection'
import CustomizeDabbaSection from '@/components/home/CustomizeDabbaSection'
import WhoIsItFor from '@/components/home/WhoIsItFor'
import WeeklyBoxPreview from '@/components/home/WeeklyBoxPreview'
import ReviewsSection from '@/components/home/ReviewsSection'
import FAQSection from '@/components/home/FAQSection'
import ContactSection from '@/components/home/ContactSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FruitDabba — Fresh Fruits Delivered to Your Doorstep',
  description: 'FruitDabba delivers fresh, handpicked seasonal fruits to your doorstep on daily subscriptions. Also subscribe to Salad, Juice, Oat Meal and Protein Bowl independently. Healthy living made simple for families, professionals, and offices in Bangalore.',
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch subscription plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price')

  return (
    <div className="overflow-hidden bg-white">
      <HeroSection />
      <HowItWorks />
      <SubscriptionCategoriesSection />
      <CustomizeDabbaSection />
      <SubscriptionCTA plans={plans ?? []} />
      <WhoIsItFor />
      <QualityPromise />
      <WeeklyBoxPreview />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
    </div>
  )
}
