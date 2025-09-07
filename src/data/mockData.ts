
import type { Vehicle, Customer, Rental, RentalRequest } from '../types';

export const initialVehicles: Vehicle[] = [
  {
    // FIX: Changed ID to number and removed serviceHistory property
    id: 1,
    brand: 'Ford Transit',
    license_plate: '1AB 1234',
    vin: 'ABC123XYZ',
    year: 2022,
    // FIX: Changed pricing keys to match VehiclePricing type ('perDay' -> 'day', removed 'perHour')
    pricing: { day: 1500 },
    stk_date: '2026-04-01',
    insurance_info: 'ČSOB, č. 123456',
    vignette_until: '2025-01-31',
  },
  {
    // FIX: Changed ID to number and removed serviceHistory property
    id: 2,
    brand: 'Renault Master',
    license_plate: '2CD 5678',
    vin: 'DEF456ABC',
    year: 2023,
    // FIX: Changed pricing key 'perDay' to 'day' to match VehiclePricing type.
    pricing: { day: 1600 },
    stk_date: '2027-07-01',
    insurance_info: 'Allianz, č. 789012',
    vignette_until: '2025-06-30',
  },
];

export const initialCustomers: Customer[] = [
  {
    // FIX: Changed ID to number
    id: 1,
    first_name: 'Jan',
    last_name: 'Novák',
    email: 'jan.novak@email.cz',
    phone: '+420 123 456 789',
    id_card_number: '123456789',
    drivers_license_number: '987654321',
  },
];

export const initialRentals: Rental[] = [
  {
    // FIX: Changed IDs to numbers
    id: 1,
    vehicleId: 1,
    customerId: 1,
    startDate: '2024-06-10T09:00',
    endDate: '2024-06-12T17:00',
    totalPrice: 4500,
    status: 'completed',
  },
];

export const initialRentalRequests: RentalRequest[] = [
    // FIX: Changed ID to number and flattened structure to match RentalRequest type
    {
        id: 1,
        first_name: 'Petra',
        last_name: 'Svobodová',
        email: 'petra.svobodova@email.com',
        phone: '+420 987 654 321',
        id_card_number: '555444333',
        drivers_license_number: '333444555',
        drivers_license_image_base64: null,
        digital_consent_at: new Date().toISOString(),
        status: 'pending',
    }
];