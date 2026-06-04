export interface Product {
  id: number
  name: string
  category: string
  location: string
  price: number
  description: string
  imageUrl: string
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(new URL('../mock/products.json', import.meta.url))
  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.statusText}`)
  }

  const products = (await response.json()) as Product[]
  return products
}
