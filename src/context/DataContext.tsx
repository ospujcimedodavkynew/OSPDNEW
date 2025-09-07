import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Vehicle, Customer, Rental, RentalRequest } from '../types';
import { supabase } from '../supabaseClient';

interface DataContextType {
    vehicles: Vehicle[];
    customers: Customer[];
    rentals: Rental[];
    rentalRequests: RentalRequest[];
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<boolean>;
    addRental: (rental: Omit<Rental, 'id'>) => Promise<boolean>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<boolean>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<boolean>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);

    const fetchData = useCallback(async () => {
        // Not setting loading(true) here to avoid flicker on re-fetch
        try {
            const [
                { data: vehiclesData, error: vehiclesError },
                { data: customersData, error: customersError },
                { data: rentalsData, error: rentalsError },
                { data: rentalRequestsData, error: rentalRequestsError },
            ] = await Promise.all([
                supabase.from('vehicles').select('*'),
                supabase.from('customers').select('*'),
                supabase.from('rentals').select('*'),
                supabase.from('rental_requests').select('*'),
            ]);

            if (vehiclesError) throw vehiclesError;
            if (customersError) throw customersError;
            if (rentalsError) throw rentalsError;
            if (rentalRequestsError) throw rentalRequestsError;

            setVehicles(vehiclesData || []);
            setCustomers(customersData || []);
            setRentals(rentalsData || []);
            setRentalRequests(rentalRequestsData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const getSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchData();
            } else {
                setLoading(false);
            }
        };
        
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (event === 'SIGNED_IN') {
                    setLoading(true);
                    await fetchData();
                }
                if (event === 'SIGNED_OUT') {
                    setVehicles([]);
                    setCustomers([]);
                    setRentals([]);
                    setRentalRequests([]);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [fetchData]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return !error;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);
    
    const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select();
        if (error) {
            console.error('Error adding vehicle:', error);
            return false;
        }
        if (data) {
            setVehicles(prev => [...prev, ...data]);
        }
        return true;
    }, []);

    const addRental = useCallback(async (rental: Omit<Rental, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select();
        if (error) {
            console.error('Error adding rental:', error);
            return false;
        }
        if(data) {
            setRentals(prev => [...prev, ...data]);
        }
        return true;
    }, []);

    const updateRental = useCallback(async (id: number, updates: Partial<Rental>): Promise<boolean> => {
        const { data, error } = await supabase.from('rentals').update(updates).eq('id', id).select();
        if (error) {
            console.error('Error updating rental:', error);
            return false;
        }
        if (data && data.length > 0) {
            setRentals(prev => prev.map(r => r.id === id ? data[0] : r));
        }
        return true;
    }, []);

    const addRentalRequest = useCallback(async (request: Omit<RentalRequest, 'id'>): Promise<boolean> => {
        const { error } = await supabase.from('rental_requests').insert([request]);
        if (error) {
            console.error('Error adding rental request:', error);
            return false;
        }
        // Admin will see it on next data fetch, no need to update state locally for a public form
        return true;
    }, []);

    const updateRentalRequestStatus = useCallback(async (id: number, status: 'approved' | 'rejected'): Promise<boolean> => {
        const { data, error } = await supabase.from('rental_requests').update({ status }).eq('id', id).select();
        if (error) {
            console.error('Error updating rental request:', error);
            return false;
        }
        if (data && data.length > 0) {
            setRentalRequests(prev => prev.map(req => req.id === id ? data[0] : req));
        }
        return true;
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        vehicles,
        customers,
        rentals,
        rentalRequests,
        login,
        logout,
        addVehicle,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus,
    }), [user, loading, vehicles, customers, rentals, rentalRequests, login, logout, addVehicle, addRental, updateRental, addRentalRequest, updateRentalRequestStatus]);

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
