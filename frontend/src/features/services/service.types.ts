export interface Service {
  id: string
  name: string
  description: string
  basePrice?: number | null
  isActive: boolean
}

export interface CreateServiceRequest {
  name: string
  description: string
  basePrice?: number | null
}

export interface UpdateServiceRequest {
  name: string
  description: string
  basePrice?: number | null
}