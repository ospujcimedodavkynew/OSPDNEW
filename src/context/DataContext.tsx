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
    addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => Promise<boolean>;
    addRental: (rental: Omit<Rental, 'id'>) => void;
    updateRental: (id: number, updates: Partial<Rental>) => void;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => void;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => void;
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    loading: boolean;
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
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [
                    { data: vehiclesData, error: vehiclesError },
                    { data: customersData, error: customersError },
                    { data: rentalsData, error: rentalsError },
                    { data: requestsData, error: requestsError }
                ] = await Promise.all([
                    supabase.from('vehicles').select('*'),
                    supabase.from('customers').select('*'),
                    supabase.from('rentals').select('*'),
                    supabase.from('rental_requests').select('*')
                ]);

                if (vehiclesError) throw vehiclesError;
                if (customersError) throw customersError;
                if (rentalsError) throw rentalsError;
                if (requestsError) throw requestsError;

                setVehicles(vehiclesData || []);
                setCustomers(customersData || []);
                setRentals(rentalsData || []);
                setRentalRequests(requestsData || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
        const { data, error } = await supabase
            .from('vehicles')
            .insert([vehicleData])
            .select();
        
        if (error) {
            console.error('Error adding vehicle:', error);
            alert(`Chyba při ukládání vozidla: ${error.message}`);
            return false;
        }

        if (data) {
            setVehicles(prev => [...prev, ...data]);
            return true;
        }
        return false;
    };


    const addRental = (rental: Omit<Rental, 'id'>) => {
        const newRental: Rental = {
            ...rental,
            id: Math.max(0, ...rentals.map(r => r.id)) + 1,
        };
        setRentals(prev => [...prev, newRental]);
    };

    const updateRental = (id: number, updates: Partial<Rental>) => {
        setRentals(prev => prev.map(r => r.id === id ? {...r, ...updates} : r));
    }

    const addRentalRequest = (request: Omit<RentalRequest, 'id'>) => {
        const newRequest: RentalRequest = {
            ...request,
            id: Math.max(0, ...rentalRequests.map(r => r.id)) + 1,
        };
        setRentalRequests(prev => [...prev, newRequest]);
    };

    const updateRentalRequestStatus = (id: number, status: 'approved' | 'rejected') => {
        setRentalRequests(prev => prev.map(req => req.id === id ? {...req, status} : req));
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
        addVehicle,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus,
        user,
        login,
        logout,
        loading,
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