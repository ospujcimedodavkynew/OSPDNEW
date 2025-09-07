// FIX: Updated all entity IDs to be of type number instead of string.
// FIX: Flattened RentalRequest to remove nested customer_details.
// FIX: Removed unused ServiceRecord and serviceHistory from Vehicle.

export interface VehiclePricing {
  hour4?: number;
  hour12?: number;
  day?: number;
  month?: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  license_plate: string;
  vin: string;
  year: number;
  pricing: VehiclePricing | null;
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