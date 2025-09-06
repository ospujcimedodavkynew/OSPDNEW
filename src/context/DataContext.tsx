import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { Vehicle, Customer, Rental, RentalRequest } from '../types';
import { supabase } from '../supabaseClient';

interface User {
    email: string;
}

interface DataContextType {
    vehicles: Vehicle[];
    customers: Customer[];
    rentals: Rental[];
    rentalRequests: RentalRequest[];
    loading: boolean;
    addRental: (rental: Omit<Rental, 'id'>) => Promise<void>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<void>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<void>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<void>;
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vehiclesRes, customersRes, rentalsRes, rentalRequestsRes] = await Promise.all([
                    supabase.from('vehicles').select('*'),
                    supabase.from('customers').select('*'),
                    supabase.from('rentals').select('*'),
                    supabase.from('rental_requests').select('*')
                ]);

                if (vehiclesRes.error) throw vehiclesRes.error;
                // Map db pricing columns to frontend type
                const vehicleData = vehiclesRes.data.map(v => ({ ...v, pricing: { perDay: v.price_per_day, perHour: v.price_per_hour }}));
                setVehicles(vehicleData || []);

                if (customersRes.error) throw customersRes.error;
                setCustomers(customersRes.data || []);

                if (rentalsRes.error) throw rentalsRes.error;
                 // Map snake_case to camelCase
                const rentalData = rentalsRes.data.map(r => ({
                    id: r.id,
                    vehicleId: r.vehicle_id,
                    customerId: r.customer_id,
                    startDate: r.start_date,
                    endDate: r.end_date,
                    totalPrice: r.total_price,
                    status: r.status,
                    customer_signature: r.customer_signature,
                    company_signature: r.company_signature,
                    digital_consent_at: r.digital_consent_at,
                }));
                setRentals(rentalData || []);


                if (rentalRequestsRes.error) throw rentalRequestsRes.error;
                // Map flat structure to frontend type
                const rentalRequestData = rentalRequestsRes.data.map(r => ({
                    id: r.id,
                    first_name: r.first_name,
                    last_name: r.last_name,
                    email: r.email,
                    phone: r.phone,
                    id_card_number: r.id_card_number,
                    drivers_license_number: r.drivers_license_number,
                    drivers_license_image_base64: r.drivers_license_image_base64,
                    digital_consent_at: r.digital_consent_at,
                    status: r.status,
                }));
                setRentalRequests(rentalRequestData || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addRental = async (rental: Omit<Rental, 'id'>) => {
        const { data, error } = await supabase.from('rentals').insert({
            vehicle_id: rental.vehicleId,
            customer_id: rental.customerId,
            start_date: rental.startDate,
            end_date: rental.endDate,
            total_price: rental.totalPrice,
            status: rental.status,
        }).select().single();

        if (error) {
            console.error("Error adding rental:", error);
        } else if (data) {
             const newRental: Rental = {
                id: data.id,
                vehicleId: data.vehicle_id,
                customerId: data.customer_id,
                startDate: data.start_date,
                endDate: data.end_date,
                totalPrice: data.total_price,
                status: data.status,
             };
            setRentals(prev => [...prev, newRental]);
        }
    };

    const updateRental = async (id: number, updates: Partial<Rental>) => {
        const dbUpdates = {
            ...(updates.startDate && { start_date: updates.startDate }),
            ...(updates.endDate && { end_date: updates.endDate }),
            ...(updates.totalPrice && { total_price: updates.totalPrice }),
            ...(updates.status && { status: updates.status }),
            ...(updates.customer_signature && { customer_signature: updates.customer_signature }),
            ...(updates.company_signature && { company_signature: updates.company_signature }),
        };

        const { error } = await supabase.from('rentals').update(dbUpdates).eq('id', id);
        
        if (error) {
            console.error("Error updating rental:", error);
        } else {
            setRentals(prev => prev.map(r => r.id === id ? {...r, ...updates} : r));
        }
    }

    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>) => {
         const { data, error } = await supabase.from('rental_requests').insert({
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            phone: request.phone,
            id_card_number: request.id_card_number,
            drivers_license_number: request.drivers_license_number,
            drivers_license_image_base64: request.drivers_license_image_base64,
            digital_consent_at: request.digital_consent_at,
            status: request.status,
        }).select().single();
        
        if (error) {
            console.error("Error adding rental request:", error);
        } else if (data) {
            setRentalRequests(prev => [...prev, data]);
        }
    };

    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('rental_requests').update({ status }).eq('id', id);
        
        if (error) {
            console.error("Error updating rental request:", error);
        } else {
            setRentalRequests(prev => prev.map(req => req.id === id ? {...req, status} : req));
        }
    };

    const login = (email: string) => {
        const newUser = { email };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = useMemo(() => ({
        vehicles,
        customers,
        rentals,
        rentalRequests,
        loading,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus,
        user,
        login,
        logout,
    }), [vehicles, customers, rentals, rentalRequests, user, loading]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};