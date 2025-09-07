
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Input, Label, Textarea } from './ui';
import { Vehicle } from '../types';

type NewVehicleState = Omit<Vehicle, 'id' | 'pricing'> & {
    price_per_day: string;
    price_per_hour?: string;
};

const Fleet: React.FC = () => {
    const { vehicles, addVehicle } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState<NewVehicleState>({
        brand: '',
        license_plate: '',
        vin: '',
        year: new Date().getFullYear(),
        stk_date: '',
        insurance_info: '',
        vignette_until: '',
        price_per_day: '',
        price_per_hour: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewVehicle(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const vehicleData = {
            ...newVehicle,
            year: Number(newVehicle.year),
            price_per_day: Number(newVehicle.price_per_day),
            price_per_hour: newVehicle.price_per_hour ? Number(newVehicle.price_per_hour) : undefined,
        };

        await addVehicle(vehicleData);
        setIsModalOpen(false);
        // Reset form
         setNewVehicle({
            brand: '',
            license_plate: '',
            vin: '',
            year: new Date().getFullYear(),
            stk_date: '',
            insurance_info: '',
            vignette_until: '',
            price_per_day: '',
            price_per_hour: '',
        });
    };

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
                        <div className="mt-4 space-y-2 text-sm">
                            <p><strong>SPZ:</strong> {vehicle.license_plate}</p>
                            <p><strong>VIN:</strong> {vehicle.vin}</p>
                            <p className="font-bold text-base mt-2"><strong>Cena/den:</strong> {vehicle.pricing.perDay} Kč</p>
                            <p><strong>STK do:</strong> {new Date(vehicle.stk_date).toLocaleDateString()}</p>
                            <p><strong>Dálniční známka do:</strong> {new Date(vehicle.vignette_until).toLocaleDateString()}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Přidat nové vozidlo">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="brand">Značka a model</Label>
                            <Input id="brand" name="brand" value={newVehicle.brand} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="year">Rok výroby</Label>
                            <Input id="year" name="year" type="number" value={newVehicle.year} onChange={handleInputChange} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="license_plate">SPZ</Label>
                            <Input id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="vin">VIN</Label>
                            <Input id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="price_per_day">Cena za den (Kč)</Label>
                            <Input id="price_per_day" name="price_per_day" type="number" value={newVehicle.price_per_day} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="price_per_hour">Cena za hodinu (Kč, volitelné)</Label>
                            <Input id="price_per_hour" name="price_per_hour" type="number" value={newVehicle.price_per_hour} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stk_date">STK platná do</Label>
                            <Input id="stk_date" name="stk_date" type="date" value={newVehicle.stk_date} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="vignette_until">Dálniční známka do</Label>
                            <Input id="vignette_until" name="vignette_until" type="date" value={newVehicle.vignette_until} onChange={handleInputChange} required />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="insurance_info">Informace o pojištění</Label>
                        <Textarea id="insurance_info" name="insurance_info" value={newVehicle.insurance_info} onChange={handleInputChange} rows={3} />
                    </div>
                    <div className="flex justify-end pt-4">
                         <Button type="submit">Uložit vozidlo</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Fleet;