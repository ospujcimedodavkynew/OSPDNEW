import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label, Stepper } from './ui';
import { Customer, Rental } from '../types';
import SignaturePad from './SignaturePad';

// Krok 1: Formulář pro zadání údajů o zákazníkovi
const CustomerStep: React.FC<{ onCustomerCreated: (customer: Customer) => void }> = ({ onCustomerCreated }) => {
    const { addCustomer } = useData();
    const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
        first_name: '', last_name: '', email: '', phone: '',
        id_card_number: '', drivers_license_number: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newCustomer = await addCustomer(formData);
        setIsSubmitting(false);
        if (newCustomer) {
            onCustomerCreated(newCustomer);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Jméno</Label><Input name="first_name" onChange={handleChange} required /></div>
                <div><Label>Příjmení</Label><Input name="last_name" onChange={handleChange} required /></div>
                <div><Label>Email</Label><Input name="email" type="email" onChange={handleChange} required /></div>
                <div><Label>Telefon</Label><Input name="phone" onChange={handleChange} required /></div>
                <div><Label>Číslo OP</Label><Input name="id_card_number" onChange={handleChange} required /></div>
                <div><Label>Číslo ŘP</Label><Input name="drivers_license_number" onChange={handleChange} required /></div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ukládání...' : 'Pokračovat k výběru vozidla'}</Button>
            </div>
        </form>
    );
};

// Krok 2: Výběr vozidla a termínu
const VehicleStep: React.FC<{ onVehicleSelected: (details: Omit<Rental, 'id' | 'customerId' | 'status'>) => void }> = ({ onVehicleSelected }) => {
    const { vehicles } = useData();
    const [vehicleId, setVehicleId] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const calculatePrice = () => {
        if (!vehicleId || !startDate || !endDate) return 0;
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle || !vehicle.pricing?.day) return 0;

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        if (start >= end) return 0;
        
        const hours = (end - start) / (1000 * 60 * 60);
        const days = Math.ceil(hours / 24);

        return days * vehicle.pricing.day;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicleId) return;
        onVehicleSelected({
            vehicleId,
            startDate,
            endDate,
            totalPrice: calculatePrice(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <Label>Vozidlo</Label>
                <select value={vehicleId} onChange={e => setVehicleId(Number(e.target.value))} className="w-full p-2 border rounded bg-white" required>
                    <option value="">Vyberte vozidlo</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} - {v.license_plate}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><Label>Začátek pronájmu</Label><Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                 <div><Label>Konec pronájmu</Label><Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
            </div>
            <p className="text-xl font-bold">Celková cena: {calculatePrice()} Kč</p>
            <div className="flex justify-end">
                <Button type="submit">Pokračovat ke smlouvě</Button>
            </div>
        </form>
    );
};

// Krok 3: Smlouva a podpis
const ContractStep: React.FC<{ customer: Customer; rentalDetails: Omit<Rental, 'id' | 'customerId' | 'status'>; onContractSigned: (rental: Rental) => void }> = ({ customer, rentalDetails, onContractSigned }) => {
    const { vehicles, addRental } = useData();
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const vehicle = vehicles.find(v => v.id === rentalDetails.vehicleId);
    
    if (!vehicle) return <p>Chyba: Vozidlo nebylo nalezeno.</p>;

    const handleSave = async () => {
        if (!signature) {
            alert("Smlouva musí být podepsána.");
            return;
        }
        setIsSubmitting(true);
        const finalRentalData: Omit<Rental, 'id'> = {
            ...rentalDetails,
            customerId: customer.id,
            status: 'active',
            customer_signature: signature,
            digital_consent_at: new Date().toISOString()
        };
        const newRental = await addRental(finalRentalData);
        setIsSubmitting(false);
        if (newRental) {
            onContractSigned(newRental);
        }
    };
    
    return (
        <div>
            <div className="prose mb-6 max-w-full">
                <h2>Smlouva o pronájmu</h2>
                <p><strong>Zákazník:</strong> {customer.first_name} {customer.last_name}, OP: {customer.id_card_number}</p>
                <p><strong>Vozidlo:</strong> {vehicle.brand}, SPZ: {vehicle.license_plate}, VIN: {vehicle.vin}</p>
                <p><strong>Doba pronájmu:</strong> od {new Date(rentalDetails.startDate).toLocaleString()} do {new Date(rentalDetails.endDate).toLocaleString()}</p>
                <p><strong>Celková cena:</strong> {rentalDetails.totalPrice} Kč</p>
                <p>Zákazník svým podpisem stvrzuje, že se seznámil s obchodními podmínkami a souhlasí s nimi.</p>
            </div>
            <Label>Podpis zákazníka</Label>
            <SignaturePad onSave={(data) => setSignature(data)} onCancel={() => setSignature(null)} />
            {signature && <img src={signature} alt="Podpis" className="mt-2 border bg-white" />}
            <div className="flex justify-end mt-6">
                <Button onClick={handleSave} disabled={!signature || isSubmitting}>{isSubmitting ? 'Vytváření...' : 'Vytvořit zápůjčku a odeslat'}</Button>
            </div>
        </div>
    );
};

// Krok 4: Potvrzení
const ConfirmationStep: React.FC<{ rental: Rental }> = ({ rental }) => {
    const navigate = useNavigate();
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Hotovo!</h2>
            <p className="mt-2">Zápůjčka č. {rental.id} byla úspěšně vytvořena.</p>
            <p>Smlouva byla odeslána na email zákazníka.</p>
            <div className="mt-6">
                <Button onClick={() => navigate('/rentals')}>Zpět na seznam půjčovného</Button>
            </div>
        </div>
    );
};

// Hlavní komponenta "průvodce"
const CreateRentalWizard: React.FC = () => {
    const { sendContractByEmail } = useData();
    const [currentStep, setCurrentStep] = useState(1);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [rentalDetails, setRentalDetails] = useState<Omit<Rental, 'id'|'customerId'|'status'> | null>(null);
    const [finalRental, setFinalRental] = useState<Rental | null>(null);
    
    const steps = ["Údaje o zákazníkovi", "Výběr vozidla", "Smlouva a podpis", "Potvrzení"];

    return (
        <Card>
            <h1 className="text-3xl font-bold mb-6">Vytvořit novou zápůjčku</h1>
            <Stepper steps={steps} currentStep={currentStep - 1} className="mb-8" />
            
            {currentStep === 1 && <CustomerStep onCustomerCreated={(c) => { setCustomer(c); setCurrentStep(2); }} />}
            {currentStep === 2 && <VehicleStep onVehicleSelected={(d) => { setRentalDetails(d); setCurrentStep(3); }} />}
            {currentStep === 3 && customer && rentalDetails && <ContractStep customer={customer} rentalDetails={rentalDetails} onContractSigned={(r) => { setFinalRental(r); setCurrentStep(4); sendContractByEmail(r.id); }} />}
            {currentStep === 4 && finalRental && <ConfirmationStep rental={finalRental} />}
        </Card>
    );
};

export default CreateRentalWizard;