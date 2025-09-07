import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Button, Card } from './ui';
import RequestApprovalModal from './RequestApprovalModal';
import { RentalRequest } from '../types';

const Rentals: React.FC = () => {
    const { rentals, customers, vehicles, rentalRequests, updateRentalRequestStatus } = useData();
    const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);

    const getCustomerName = (customerId: number) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Neznámý';
    };

    const getVehicleName = (vehicleId: number) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? vehicle.brand : 'Neznámé';
    };

    const handleApprove = (req: RentalRequest) => {
        updateRentalRequestStatus(req.id, 'approved');
        setSelectedRequest(null);
    };

    const handleReject = (req: RentalRequest) => {
        updateRentalRequestStatus(req.id, 'rejected');
        setSelectedRequest(null);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Půjčovné</h1>
                <Link to="/rentals/new">
                    <Button>Vytvořit novou zápůjčku</Button>
                </Link>
            </div>

            <Card className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Čekající žádosti</h2>
                {rentalRequests.filter(r => r.status === 'pending').length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                {/* FIX: Updated border color to match light theme */}
                                <tr className="border-b border-border">
                                    <th className="p-2">Zákazník</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Telefon</th>
                                    <th className="p-2">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalRequests.filter(r => r.status === 'pending').map(req => (
                                    // FIX: Updated border color to match light theme
                                    <tr key={req.id} className="border-b border-border">
                                        <td className="p-2">{req.first_name} {req.last_name}</td>
                                        <td className="p-2">{req.email}</td>
                                        <td className="p-2">{req.phone}</td>
                                        <td className="p-2">
                                            <Button onClick={() => setSelectedRequest(req)}>Zobrazit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p>Žádné nové žádosti.</p>}
            </Card>

            <Card>
                <h2 className="text-2xl font-bold mb-4">Existující zápůjčky</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            {/* FIX: Updated border color to match light theme */}
                            <tr className="border-b border-border">
                                <th className="p-2">Vozidlo</th>
                                <th className="p-2">Zákazník</th>
                                <th className="p-2">Od</th>
                                <th className="p-2">Do</th>
                                <th className="p-2">Stav</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.map(rental => (
                                // FIX: Updated border and hover colors to match light theme
                                <tr key={rental.id} className="border-b border-border hover:bg-gray-100">
                                    <td className="p-2">{getVehicleName(rental.vehicleId)}</td>
                                    <td className="p-2">{getCustomerName(rental.customerId)}</td>
                                    <td className="p-2">{new Date(rental.startDate).toLocaleString()}</td>
                                    <td className="p-2">{new Date(rental.endDate).toLocaleString()}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${rental.status === 'active' ? 'bg-green-500' : rental.status === 'completed' ? 'bg-gray-500' : 'bg-yellow-500'}`}>
                                            {rental.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedRequest && (
                <RequestApprovalModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    rentalRequest={selectedRequest}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default Rentals;