import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Vehicle, Customer, Rental, RentalRequest } from '../types';
import { supabase } from '../supabaseClient';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface DataContextType {
    vehicles: Vehicle[];
    customers: Customer[];
    rentals: Rental[];
    rentalRequests: RentalRequest[];
    addRental: (rental: Omit<Rental, 'id'>) => Promise<boolean>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<boolean>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<boolean>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<boolean>;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
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
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchData();
            } else {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchData();
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [fetchData]);

    const addRental = async (rental: Omit<Rental, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select();
        if (error) {
            console.error("Error adding rental:", error);
            return false;
        }
        if (data) {
            setRentals(prev => [...prev, ...data]);
        }
        return true;
    };

    const updateRental = async (id: number, updates: Partial<Rental>): Promise<boolean> => {
        const { error } = await supabase.from('rentals').update(updates).eq('id', id);
        if (error) {
            console.error("Error updating rental:", error);
            return false;
        }
        setRentals(prev => prev.map(r => r.id === id ? {...r, ...updates} : r));
        return true;
    };

    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('rental_requests').insert([request]).select();
         if (error) {
            console.error("Error adding rental request:", error);
            return false;
        }
        if (data) {
           setRentalRequests(prev => [...prev, ...data]);
        }
        return true;
    };

    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected'): Promise<boolean> => {
        const { error } = await supabase.from('rental_requests').update({ status }).eq('id', id);
        if (error) {
            console.error("Error updating rental request:", error);
            return false;
        }
        setRentalRequests(prev => prev.map(req => req.id === id ? {...req, status} : req));
        return true;
    };

    const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select();
        if (error) {
            console.error("Error adding vehicle:", error);
            return false;
        }
        if (data) {
            setVehicles(prev => [...prev, ...data]);
        }
        return true;
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return !error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setVehicles([]);
        setCustomers([]);
        setRentals([]);
        setRentalRequests([]);
    };

    const value = useMemo(() => ({
        vehicles,
        customers,
        rentals,
        rentalRequests,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus,
        addVehicle,
        user,
        login,
        logout,
        loading,
    }), [vehicles, customers, rentals, rentalRequests, user, loading, addRental, updateRental, addRentalRequest, updateRentalRequestStatus, addVehicle, login, logout]);

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
