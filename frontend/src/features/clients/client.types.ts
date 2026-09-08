export interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  isActive: boolean
}
