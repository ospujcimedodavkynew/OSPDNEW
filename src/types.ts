
export interface ServiceRecord {
  id: number;
  date: string;
  description: string;
  cost: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  license_plate: string;
  vin: string;
  year: number;
  // serviceHistory is in a separate table, removed for simplicity for now
  // serviceHistory: ServiceRecord[]; 
  // FIX: Replaced price_per_day and price_per_hour with a nested pricing object
  // to match data structure used in the application context and components.
  pricing: {
    perDay: number;
    perHour?: number;
  };
  stk_date: string;
  insurance_info: string;
  vignette_until: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_card_number: string;
  drivers_license_number: string;
  drivers_license_image_path?: string | null;
}

export interface Rental {
  id: number;
  vehicleId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'completed' | 'pending';
  customer_signature?: string;
  company_signature?: string;
  digital_consent_at?: string | null;
}

export interface RentalRequest {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    id_card_number: string;
    drivers_license_number: string;
    drivers_license_image_base64: string | null;
    digital_consent_at: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}