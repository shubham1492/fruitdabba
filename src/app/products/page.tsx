export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Fresh Fruits',
  description: 'Browse our complete collection of fresh, seasonal, and exotic fruits.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('in_stock', true)
    .order('name')

  if (params.category) {
    const cat = (categories as any[])?.find((c: any) => c.slug === params.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data: products } = await query

  return (
    <ProductsClient
      products={products ?? []}
      categories={categories ?? []}
      activeCategory={params.category}
      initialSearch={params.search}
    />
  )
}
