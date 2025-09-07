import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Label, Input, Textarea } from './ui';
import { Vehicle, VehiclePricing } from '../types';

const VehicleForm: React.FC<{
    onSubmit: (vehicle: Omit<Vehicle, 'id'>) => Promise<boolean>;
    onClose: () => void;
}> = ({ onSubmit, onClose }) => {
    const [brand, setBrand] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [vin, setVin] = useState('');
    const [year, setYear] = useState<number | ''>(new Date().getFullYear());
    const [stkDate, setStkDate] = useState('');
    const [vignetteUntil, setVignetteUntil] = useState('');
    const [insuranceInfo, setInsuranceInfo] = useState('');
    const [pricing, setPricing] = useState<VehiclePricing>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPricing(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit({
            brand,
            license_plate: licensePlate,
            vin,
            year: Number(year),
            stk_date: stkDate,
            vignette_until: vignetteUntil,
            insurance_info: insuranceInfo,
            pricing,
        });
        setIsSubmitting(false);
        if (success) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="brand">Značka a model</Label>
                    <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="year">Rok výroby</Label>
                    <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value ? parseInt(e.target.value, 10) : '')} required />
                </div>
                <div>
                    <Label htmlFor="licensePlate">SPZ</Label>
                    <Input id="licensePlate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="vin">VIN</Label>
                    <Input id="vin" value={vin} onChange={e => setVin(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="stkDate">STK platná do</Label>
                    <Input id="stkDate" type="date" value={stkDate} onChange={e => setStkDate(e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="vignetteUntil">Dálniční známka do</Label>
                    <Input id="vignetteUntil" type="date" value={vignetteUntil} onChange={e => setVignetteUntil(e.target.value)} required />
                </div>
            </div>
            
            <div>
                 <Label htmlFor="insuranceInfo">Informace o pojištění</Label>
                 <Textarea id="insuranceInfo" value={insuranceInfo} onChange={e => setInsuranceInfo(e.target.value)} rows={3}/>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-2">Ceník (Kč)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="hour4">4 hodiny</Label>
                        <Input id="hour4" name="hour4" type="number" value={pricing.hour4 || ''} onChange={handlePriceChange} />
                    </div>
                     <div>
                        <Label htmlFor="hour12">12 hodin</Label>
                        <Input id="hour12" name="hour12" type="number" value={pricing.hour12 || ''} onChange={handlePriceChange} />
                    </div>
                     <div>
                        <Label htmlFor="day">Celý den</Label>
                        <Input id="day" name="day" type="number" value={pricing.day || ''} onChange={handlePriceChange} />
                    </div>
                     <div>
                        <Label htmlFor="month">Měsíc (30 dní)</Label>
                        <Input id="month" name="month" type="number" value={pricing.month || ''} onChange={handlePriceChange} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Ukládání...' : 'Uložit vozidlo'}
                </Button>
            </div>
        </form>
    );
};


const Fleet: React.FC = () => {
    const { vehicles, addVehicle } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Vozový park</h1>
                <Button onClick={() => setIsModalOpen(true)}>Přidat nové vozidlo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <Card key={vehicle.id}>
                        <h2 className="text-xl font-bold">{vehicle.brand}</h2>
                        <p className="text-text-secondary">{vehicle.year}</p>
                        <div className="mt-4 space-y-2">
                            <p><strong>SPZ:</strong> {vehicle.license_plate}</p>
                            <p><strong>VIN:</strong> {vehicle.vin}</p>
                            <div className="text-sm">
                                {vehicle.pricing?.hour4 && <p><strong>4h:</strong> {vehicle.pricing.hour4} Kč</p>}
                                {vehicle.pricing?.hour12 && <p><strong>12h:</strong> {vehicle.pricing.hour12} Kč</p>}
                                {vehicle.pricing?.day && <p><strong>Den:</strong> {vehicle.pricing.day} Kč</p>}
                                {vehicle.pricing?.month && <p><strong>Měsíc:</strong> {vehicle.pricing.month} Kč</p>}
                            </div>
                            <p><strong>STK do:</strong> {new Date(vehicle.stk_date).toLocaleDateString()}</p>
                        </div>
                    </Card>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Přidat nové vozidlo">
                <VehicleForm onSubmit={addVehicle} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Fleet;
