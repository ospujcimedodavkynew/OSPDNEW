import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Vehicle, Customer, Rental, RentalRequest } from '../types';
import { supabase } from '../supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface DataContextType {
    vehicles: Vehicle[];
    customers: Customer[];
    rentals: Rental[];
    rentalRequests: RentalRequest[];
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<boolean>;
    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null>;
    addRental: (rental: Omit<Rental, 'id'>) => Promise<Rental | null>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<void>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => void;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => void;
    sendContractByEmail: (rentalId: number) => Promise<void>;
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
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
        setLoading(true);
        try {
            const [vehiclesRes, customersRes, rentalsRes, rentalRequestsRes] = await Promise.all([
                supabase.from('vehicles').select('*'),
                supabase.from('customers').select('*'),
                supabase.from('rentals').select('*'),
                supabase.from('rental_requests').select('*')
            ]);
            if (vehiclesRes.error) throw vehiclesRes.error;
            if (customersRes.error) throw customersRes.error;
            if (rentalsRes.error) throw rentalsRes.error;
            if (rentalRequestsRes.error) throw rentalRequestsRes.error;
            
            setVehicles(vehiclesRes.data || []);
            setCustomers(customersRes.data || []);
            setRentals(rentalsRes.data || []);
            setRentalRequests(rentalRequestsRes.data || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData();
            } else {
                setLoading(false);
            }
        });
        
        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
    }, [fetchData]);

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        return !error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setVehicles([]);
        setCustomers([]);
        setRentals([]);
        setRentalRequests([]);
        setUser(null);
    };

    const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<boolean> => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select();
        if (error) {
            console.error("Error adding vehicle:", error);
            alert("Chyba při ukládání vozidla: " + error.message);
            return false;
        }
        if (data) {
           setVehicles(prev => [...prev, ...data]);
        }
        return true;
    };

    const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
        const { data, error } = await supabase.from('customers').insert([customer]).select().single();
        if (error) {
            console.error("Error adding customer:", error);
            alert("Chyba při ukládání zákazníka: " + error.message);
            return null;
        }
        if (data) {
            setCustomers(prev => [...prev, data]);
        }
        return data;
    };

    const addRental = async (rental: Omit<Rental, 'id'>): Promise<Rental | null> => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select().single();
        if (error) {
            console.error("Error adding rental:", error);
            alert("Chyba při vytváření zápůjčky: " + error.message);
            return null;
        }
        if (data) {
            setRentals(prev => [...prev, data]);
        }
        return data;
    };
    
    const sendContractByEmail = async (rentalId: number) => {
        try {
            const { error } = await supabase.functions.invoke('send-contract', {
                body: { rentalId },
            });
            if (error) throw error;
            console.log("Email function invoked successfully for rental ID:", rentalId);
            alert("Smlouva byla úspěšně odeslána.");
        } catch (error) {
            console.error("Error invoking email function:", error);
            alert("Chyba při odesílání smlouvy. Funkce je pravděpodobně neaktivní. Viz logy.");
        }
    };

    // --- Mock functions to be replaced ---
    const updateRental = async (id: number, updates: Partial<Rental>) => {
       const { data, error } = await supabase.from('rentals').update(updates).eq('id', id).select().single();
       if(error) console.error(error);
       if(data) {
         setRentals(prev => prev.map(r => r.id === id ? data : r));
       }
    }
    const addRentalRequest = (request: Omit<RentalRequest, 'id'>) => {
        // Implement Supabase call
    };
    const updateRentalRequestStatus = (id: number, status: 'approved' | 'rejected') => {
        // Implement Supabase call
    };


    const value: DataContextType = {
        vehicles, customers, rentals, rentalRequests,
        addVehicle, addCustomer, addRental, updateRental,
        addRentalRequest, updateRentalRequestStatus, sendContractByEmail,
        user, login, logout, loading,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
