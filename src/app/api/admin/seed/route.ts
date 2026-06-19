import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const DEMO_PRODUCTS = [
  {
    name: 'Alphonso Mango',
    slug: 'alphonso-mango',
    description: 'The king of mangoes. Rich, creamy, and aromatic. Sourced from Ratnagiri, Maharashtra.',
    price: 599,
    unit: '1 kg (6-8 pieces)',
    category: 'Tropical',
    is_featured: true,
    image_url: '/images/fruit-mango.png',
    nutritional_info: { calories: '99 kcal', vitamin_c: '36mg', fiber: '1.8g' },
  },
  {
    name: 'Fresh Strawberries',
    slug: 'fresh-strawberries',
    description: 'Juicy, sweet strawberries from Mahabaleshwar. Perfect for smoothies and desserts.',
    price: 249,
    unit: '500 g punnet',
    category: 'Berries',
    is_featured: true,
    image_url: '/images/fruit-berries.png',
    nutritional_info: { calories: '32 kcal', vitamin_c: '58mg', fiber: '2g' },
  },
  {
    name: 'Seedless Green Grapes',
    slug: 'seedless-green-grapes',
    description: 'Crisp and refreshing seedless green grapes. Great for snacking and fruit salads.',
    price: 199,
    unit: '500 g',
    category: 'Seasonal Fruits',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1423347834838-5162bb452ca4?w=400',
    nutritional_info: { calories: '69 kcal', potassium: '191mg', fiber: '0.9g' },
  },
  {
    name: 'Kiwi Fruit',
    slug: 'kiwi-fruit',
    description: 'Tangy and vitamin-packed New Zealand kiwis. High in Vitamin C and antioxidants.',
    price: 349,
    unit: '6 pieces',
    category: 'Exotic Fruits',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=400',
    nutritional_info: { calories: '61 kcal', vitamin_c: '92mg', fiber: '3g' },
  },
  {
    name: 'Pomelo',
    slug: 'pomelo',
    description: 'Giant citrus fruit with sweet-tart flavor. Rich in fiber and essential vitamins.',
    price: 149,
    unit: '1 piece (~800g)',
    category: 'Citrus',
    is_featured: false,
    image_url: '/images/fruit-citrus.png',
    nutritional_info: { calories: '38 kcal', vitamin_c: '61mg', fiber: '1g' },
  },
  {
    name: 'Dragon Fruit',
    slug: 'dragon-fruit',
    description: 'Exotic pink dragon fruit with white flesh. Mild flavor, stunning appearance.',
    price: 299,
    unit: '1 piece (~400g)',
    category: 'Exotic Fruits',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400',
    nutritional_info: { calories: '60 kcal', iron: '0.74mg', fiber: '3g' },
  },
  {
    name: 'Navel Orange',
    slug: 'navel-orange',
    description: 'Sweet and juicy navel oranges. Perfect for juicing and direct consumption.',
    price: 129,
    unit: '1 kg (4-5 pieces)',
    category: 'Citrus',
    is_featured: true,
    image_url: '/images/fruit-citrus.png',
    nutritional_info: { calories: '47 kcal', vitamin_c: '53mg', fiber: '2.4g' },
  },
  {
    name: 'Chikoo (Sapota)',
    slug: 'chikoo-sapota',
    description: 'Sweet, brown sapota with caramel-like taste. A classic Indian fruit.',
    price: 99,
    unit: '500 g (6-8 pieces)',
    category: 'Seasonal Fruits',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400',
    nutritional_info: { calories: '83 kcal', iron: '0.8mg', fiber: '5.3g' },
  },
  {
    name: 'Blueberries',
    slug: 'blueberries',
    description: 'Premium imported blueberries. Packed with antioxidants and brain-boosting benefits.',
    price: 499,
    unit: '125 g punnet',
    category: 'Berries',
    is_featured: true,
    image_url: '/images/fruit-berries.png',
    nutritional_info: { calories: '57 kcal', vitamin_c: '9.7mg', fiber: '2.4g' },
  },
  {
    name: 'Pineapple',
    slug: 'pineapple',
    description: 'Sweet and tangy fresh pineapple from Kerala. Great for grilling and tropical smoothies.',
    price: 79,
    unit: '1 piece (~1.2kg)',
    category: 'Tropical',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400',
    nutritional_info: { calories: '50 kcal', vitamin_c: '47mg', fiber: '1.4g' },
  },
  {
    name: 'Anjeer (Dried Figs)',
    slug: 'dried-figs-anjeer',
    description: 'Premium quality dried figs. Rich in iron and calcium. Great as a health snack.',
    price: 449,
    unit: '250 g',
    category: 'Dry Fruits',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=400',
    nutritional_info: { calories: '74 kcal', iron: '0.37mg', fiber: '2.9g' },
  },
  {
    name: 'Custard Apple',
    slug: 'custard-apple',
    description: 'Creamy and sweet sitaphal (custard apple). A seasonal Indian delicacy.',
    price: 199,
    unit: '2 pieces',
    category: 'Seasonal Fruits',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400',
    nutritional_info: { calories: '101 kcal', vitamin_c: '19mg', fiber: '4.4g' },
  },
  // À la carte items (Daily Cravings)
  {
    name: 'Signature Fruit Bowl',
    slug: 'signature-fruit-bowl',
    description: 'Watermelon, papaya, pineapple, kiwi & pomegranate, freshly cut.',
    price: 149,
    unit: '1 bowl (~400g)',
    category: 'Bowls',
    is_featured: true,
    image_url: '/images/item-fruit-bowl.png',
    nutritional_info: { calories: '140 kcal', fiber: '4.2g', vitamins: 'A, C' },
  },
  {
    name: 'Triple Melon Bowl',
    slug: 'triple-melon-bowl',
    description: 'Cooling watermelon, cantaloupe & honeydew melon cubes.',
    price: 139,
    unit: '1 bowl (~400g)',
    category: 'Bowls',
    is_featured: true,
    image_url: '/images/item-melon-bowl.png',
    nutritional_info: { calories: '110 kcal', fiber: '2.5g', vitamins: 'C' },
  },
  {
    name: 'Cold-Pressed Orange Juice',
    slug: 'cold-pressed-orange',
    description: '100% pure squeezed oranges, no added sugar or water.',
    price: 119,
    unit: '1 bottle (250ml)',
    category: 'Juices',
    is_featured: true,
    image_url: '/images/item-orange-juice.png',
    nutritional_info: { calories: '120 kcal', vitamin_c: '124mg', potassium: '496mg' },
  },
  {
    name: 'Green Detox Juice',
    slug: 'green-detox-juice',
    description: 'Apple, cucumber, spinach & mint for a clean energy boost.',
    price: 129,
    unit: '1 bottle (250ml)',
    category: 'Juices',
    is_featured: true,
    image_url: '/images/item-green-juice.png',
    nutritional_info: { calories: '95 kcal', vitamin_k: '120mcg', iron: '1.2mg' },
  },
  {
    name: 'Garden Fruit Salad',
    slug: 'garden-fruit-salad',
    description: 'Mixed greens, berries, orange segments & pomegranate.',
    price: 159,
    unit: '1 bowl (~350g)',
    category: 'Salads',
    is_featured: true,
    image_url: '/images/item-fruit-salad.png',
    nutritional_info: { calories: '150 kcal', fiber: '5.1g', vitamin_c: '45mg' },
  },
  {
    name: 'Mixed Berry Smoothie',
    slug: 'mixed-berry-smoothie',
    description: 'Strawberry, blueberry & banana blended with yogurt.',
    price: 169,
    unit: '1 bottle (300ml)',
    category: 'Smoothies',
    is_featured: true,
    image_url: '/images/item-berry-smoothie.png',
    nutritional_info: { calories: '210 kcal', protein: '6g', calcium: '150mg' },
  },
  {
    name: 'Alphonso Mango Smoothie',
    slug: 'alphonso-mango-smoothie',
    description: 'Creamy Alphonso mango blended with chilled yogurt.',
    price: 169,
    unit: '1 bottle (300ml)',
    category: 'Smoothies',
    is_featured: true,
    image_url: '/images/item-mango-smoothie.png',
    nutritional_info: { calories: '230 kcal', protein: '5g', vitamin_a: '25%' },
  },
]

const DEMO_PLANS = [
  {
    name: 'Basic Pack',
    slug: 'basic-pack',
    description: 'Weight: 300-350 gms. Minimum 4-5 fruits per day.',
    price: 3060.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Weight: 300-350 gms', 'Minimum 4-5 fruits', 'Excludes Sundays (26 deliveries)', 'Free doorstep delivery', 'Sourced fresh daily'],
  },
  {
    name: 'Mini Pack',
    slug: 'mini-pack',
    description: 'Weight: 400-450 gms. Minimum 4-5 fruits per day.',
    price: 3580.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Weight: 400-450 gms', 'Minimum 4-5 fruits', 'Excludes Sundays (26 deliveries)', 'Free doorstep delivery', 'Sourced fresh daily'],
  },
  {
    name: 'Medium Pack',
    slug: 'medium-pack',
    description: 'Weight: 500-550 gms. Includes 4-5 fruits + legumes.',
    price: 4100.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: true,
    features: ['Weight: 500-550 gms', '4-5 fruits + healthy legumes', 'Excludes Sundays (26 deliveries)', 'Free doorstep delivery', 'High protein & nutrients'],
  },
  {
    name: 'Premium Pack',
    slug: 'premium-pack',
    description: 'Weight: 700-750 gms. Includes 6-7 fruits + legumes + nuts.',
    price: 4620.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Weight: 700-750 gms', '6-7 fruits + legumes + premium nuts', 'Excludes Sundays (26 deliveries)', 'Free priority delivery', 'Complete daily nutrition'],
  },
  {
    name: 'Gym High Protein Pack',
    slug: 'gym-protein-pack',
    description: 'Daily high-protein salad bowl with premium healthy add-ins.',
    price: 4999.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Daily High-protein salad bowl', 'Includes pomegranate, kiwi, paneer/tofu', 'Excludes Sundays (26 deliveries)', 'Free doorstep delivery', 'High protein & fiber-rich'],
  },
  {
    name: 'Corn Chaat & Salad Pack',
    slug: 'corn-chaat-pack',
    description: 'Daily fresh tangy corn chaat and green salad mix.',
    price: 3990.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Daily fresh corn chaat', 'Tangy & fiber-rich mix', 'Excludes Sundays (26 deliveries)', 'Free doorstep delivery', 'Perfect afternoon snack'],
  },
  {
    name: 'Custom Dabba Pack',
    slug: 'custom-pack',
    description: 'Fully customized daily health pack based on your choices.',
    price: 3000.00,
    duration_days: 30,
    discount_pct: 0,
    delivery_frequency: 'daily',
    is_popular: false,
    features: ['Choose your own ingredients', 'Base price of ₹3,000', 'Custom categories and exclusions', 'Flexible portion pack size', 'Add-ons added dynamically'],
  },
]

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding not allowed in production' }, { status: 403 })
  }

  try {
    const supabase = await createAdminClient()

    // 1. Seed categories
    const categoriesToSeed = [
      { name: 'Seasonal Fruits', slug: 'seasonal' },
      { name: 'Exotic Fruits', slug: 'exotic' },
      { name: 'Citrus', slug: 'citrus' },
      { name: 'Berries', slug: 'berries' },
      { name: 'Tropical', slug: 'tropical' },
      { name: 'Dry Fruits', slug: 'dry-fruits' },
      { name: 'Bowls', slug: 'bowls' },
      { name: 'Juices', slug: 'juices' },
      { name: 'Salads', slug: 'salads' },
      { name: 'Smoothies', slug: 'smoothies' },
    ]

    const { error: catUpsertError } = await supabase
      .from('categories')
      .upsert(categoriesToSeed, { onConflict: 'slug' })

    if (catUpsertError) throw catUpsertError

    // Retrieve categories
    const { data: categories } = await supabase.from('categories').select('id, name')
    if (!categories) throw new Error('No categories found')

    const catMap = Object.fromEntries((categories as any[]).map((c: any) => [c.name, c.id]))

    // 2. Seed products
    const products = DEMO_PRODUCTS.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      unit: p.unit,
      image_url: p.image_url,
      category_id: catMap[p.category] || null,
      in_stock: true,
      is_featured: p.is_featured,
      nutritional_info: p.nutritional_info,
    }))

    const { error: prodError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'slug' })

    if (prodError) throw prodError

    // 3. Seed plans
    const plans = DEMO_PLANS.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      duration_days: p.duration_days,
      discount_pct: p.discount_pct,
      delivery_frequency: p.delivery_frequency,
      is_popular: p.is_popular,
      features: p.features,
    }))

    const { error: planError } = await supabase
      .from('subscription_plans')
      .upsert(plans, { onConflict: 'slug' })

    if (planError) throw planError

    return NextResponse.json({ success: true, seededProducts: products.length, seededPlans: plans.length })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
