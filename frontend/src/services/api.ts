const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  condition: string;
  status: string;
  seller: {
    id: number;
    name: string;
  };
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('campusreuse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getProducts(search?: string): Promise<Product[]> {
  const url = search ? `${API_BASE}/api/products?search=${encodeURIComponent(search)}` : `${API_BASE}/api/products`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Please login first to view campus resources.');
    }
    throw new Error(`Failed to load products: ${response.statusText}`);
  }

  return response.json();
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE}/api/products/${id}`, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    throw new Error(`Failed to load product: ${response.statusText}`);
  }

  return response.json();
}

export async function createProduct(productData: FormData): Promise<Product> {
  const response = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeaders()['Authorization'] || '',
    },
    body: productData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create product');
  }

  return response.json();
}

export async function updateProductStatus(id: number, status: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/api/products/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update status`);
  }

  return response.json();
}

// Inquiries

export async function createInquiry(productId: number): Promise<any> {
  const response = await fetch(`${API_BASE}/api/inquiries/product/${productId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send inquiry');
  }
  return response.json();
}

export async function getSentInquiries(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/inquiries/sent`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to load sent inquiries');
  return response.json();
}

export async function getReceivedInquiries(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/inquiries/received`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to load received inquiries');
  return response.json();
}

export async function respondToInquiry(id: number, action: string, phoneNumber?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/inquiries/${id}/respond`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, phoneNumber }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to respond to inquiry');
  }
  return response.json();
}

// Recommendations

export async function logProductView(productId: number): Promise<void> {
  await fetch(`${API_BASE}/api/products/${productId}/view`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function getRecommendations(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/api/products/me/recommendations`, { headers: getAuthHeaders() });
  if (!response.ok) return [];
  return response.json();
}

export async function getRecentlyViewed(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/api/products/me/recently-viewed`, { headers: getAuthHeaders() });
  if (!response.ok) return [];
  return response.json();
}
