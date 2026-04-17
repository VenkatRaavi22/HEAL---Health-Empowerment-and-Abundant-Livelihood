import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Pill, Clock, AlertTriangle, Edit2, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { Modal } from '../components/ui/Modal';

export default function Medication() {
    const [meds, setMeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMed, setEditingMed] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        time: '',
        remaining_tablets: '',
        total_tablets: ''
    });

    const fetchMeds = async () => {
        try {
            setLoading(true);
            const data = await api("/medications");
            setMeds(data);
        } catch (err) {
            console.error("Failed to fetch medications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeds();
    }, []);

    const handleOpenModal = (med: any = null) => {
        if (med) {
            setEditingMed(med);
            setFormData({
                name: med.medicine_name || med.name,
                dosage: med.dosage || '',
                time: med.time || '',
                remaining_tablets: med.remaining_tablets?.toString() || '',
                total_tablets: med.total_tablets?.toString() || ''
            });
        } else {
            setEditingMed(null);
            setFormData({
                name: '',
                dosage: '',
                time: '',
                remaining_tablets: '',
                total_tablets: ''
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                remaining_tablets: parseInt(formData.remaining_tablets) || 0,
                total_tablets: parseInt(formData.total_tablets) || 0
            };

            if (editingMed) {
                await api(`/medications/${editingMed.med_id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                await api("/medications", {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }


            fetchMeds();
            setModalOpen(false);
        } catch (err) {
            console.error("Failed to save medication", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this medication?")) return;
        try {
            await api(`/medications/${id}`, {
                method: 'DELETE'
            });
            fetchMeds();
        } catch (err) {
            console.error("Failed to delete medication", err);
        }
    };

    const handleRestock = (medicationName: string) => {
        const query = encodeURIComponent(medicationName.trim());
        window.open(`https://www.1mg.com/search/all?name=${query}`, '_blank', 'noopener,noreferrer');
    };


    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Medication Tracker</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your prescriptions and daily intake</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus className="w-4 h-4" /> Add New
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>Loading your medications...</p>
                </div>
            ) : meds.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Pill className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg">No medications found</p>
                    <p className="text-gray-500 mb-6">Start by adding your first medication tracker</p>
                    <Button variant="secondary" onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Medication
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {meds.map((med) => (
                        <Card key={med.med_id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                                        <Pill className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{med.medicine_name || med.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{med.dosage}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                                        <Clock className="w-3 h-3" /> {med.time?.substring(0, 5) || '--:--'}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenModal(med)}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => handleDelete(med.med_id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className={med.remaining_tablets < 15 ? 'text-red-500' : 'text-gray-600'}>
                                        {med.remaining_tablets} tablets left
                                    </span>
                                    <span className="text-gray-400 font-medium">of {med.total_tablets} total</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${med.remaining_tablets < 15 ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
                                        style={{ width: `${Math.min(100, (med.remaining_tablets / med.total_tablets) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {med.remaining_tablets < 5 && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                        <AlertTriangle className="w-4 h-4" />
                                        Time to refill your prescription
                                    </div>
                                    <button
                                        onClick={() => handleRestock(med.medicine_name || med.name)}
                                        aria-label={`Restock ${med.medicine_name || med.name} on 1mg`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm text-white
                                            bg-gradient-to-r from-purple-600 to-violet-600
                                            shadow-md hover:shadow-purple-300 hover:shadow-lg
                                            hover:scale-[1.02] active:scale-[0.98]
                                            transition-all duration-200 ease-in-out
                                            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Restock Now
                                    </button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {!loading && meds.length > 0 && (
                <Card className="bg-gray-50 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-gray-500 font-bold mb-3">Have another prescription?</p>
                    <Button variant="outline" onClick={() => handleOpenModal()} className="bg-white">
                        Add New Medication
                    </Button>
                </Card>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingMed ? 'Edit Medication' : 'Add New Medication'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Medication Name</label>
                        <Input
                            placeholder="e.g. Metformin"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Dosage</label>
                            <Input
                                placeholder="e.g. 500mg"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Time</label>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Stock Left</label>
                            <Input
                                type="number"
                                placeholder="Remaining"
                                value={formData.remaining_tablets}
                                onChange={(e) => setFormData({ ...formData, remaining_tablets: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Total Pack</label>
                            <Input
                                type="number"
                                placeholder="Total"
                                value={formData.total_tablets}
                                onChange={(e) => setFormData({ ...formData, total_tablets: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            fullWidth
                            onClick={() => setModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            disabled={submitting}
                            className="bg-primary"
                        >
                            {submitting ? 'Saving...' : editingMed ? 'Save Changes' : 'Add Medication'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
