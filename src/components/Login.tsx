

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button, Card, Input, Label } from './ui';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd validate the password.
        // Here we just log in with the email.
        if (email) {
            login(email);
            navigate('/');
        } else {
            alert('Please enter an email.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit}>
                    <h1 className="text-2xl font-bold mb-6 text-center">Přihlášení</h1>
                    <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <Label htmlFor="password">Heslo</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Button type="submit">
                            Přihlásit se
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;