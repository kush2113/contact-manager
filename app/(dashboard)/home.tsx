import React, {useEffect, useState} from 'react';
import {
    Search,
    Plus,
    Phone,
    Mail,
    MessageCircle,
    Star,
    MoreVertical,
    Users,
    Clock,
    X,
    Save,
    User,
    MapPin,
    Calendar,
    Briefcase,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import {Contact} from "@/types/contact";
import {deleteContact, saveContact} from "@/services/contactService";
import {collection, onSnapshot} from "firebase/firestore";
import {auth, db} from "@/firebase";

const ContactManagerHome = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>();

    const [contacts, setContacts] = useState<Contact[]>([

    ]);

    const [formData, setFormData] = useState<Contact>({
        id: '',
        name: '',
        phone: '',
        email: '',
        avatar: '',
        isFavorite: false,
        lastContact: '',
        status: '',
        address: '',
        birthday: '',
        company: ''
    });

    useEffect( () => {
        const unsubscribe = onSnapshot(
            collection(db, "contacts"),
            (querySnapshot) => {
                const allContact = querySnapshot.docs
                    .filter((doc) => doc.data().uId === auth.currentUser?.uid)
                    .map(
                        (doc) =>
                            ({
                                ...doc.data(),
                                id: doc.id
                            } as Contact)
                    )

                console.log("Fetched notes:", allContact);
                setContacts(allContact);
            }
        );

        // cleanup function
        return () => unsubscribe();
    }, []);

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone.includes(searchQuery) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'favorites') return matchesSearch && contact.isFavorite;
        if (activeTab === 'recent') return matchesSearch;
        return matchesSearch;
    });

    const stats = {
        total: contacts.length,
        favorites: contacts.filter(c => c.isFavorite).length,
        online: contacts.filter(c => c.status === 'online').length
    };

    const handleInputChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateAvatar =  (name: string) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return name.substring(0, 2);
    };

    const handleSaveContact = async () => {
        if (!formData.name.trim() || !formData.phone.trim()) {
            alert('Name and phone number are required!');
            return;
        }

        const newContact : Contact= {
            id: Date.now().toString(),
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            avatar: generateAvatar(formData.name.trim()).toUpperCase(),
            isFavorite: formData.isFavorite,
            lastContact: "Just added",
            status: "offline",
            address: formData.address.trim(),
            birthday: formData.birthday,
            company: formData.company.trim()
        };

        try {
            await saveContact(newContact);
            setContacts(prev => [...prev, newContact]);
        } catch (error) {
            console.error("Error saving contact", error);
        }
        setFormData({
            id: '',
            name: '',
            phone: '',
            email: '',
            avatar: '',
            isFavorite: false,
            lastContact: '',
            status: '',
            address: '',
            birthday: '',
            company: ''
        });
        setShowModal(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            id: '',
            name: '',
            phone: '',
            email: '',
            avatar: '',
            isFavorite: false,
            lastContact: '',
            status: '',
            address: '',
            birthday: '',
            company: ''
        });
    };

    const handleDeleteClick = (contact: Contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (contactToDelete) {
            await deleteContact(contactToDelete.id);
            //setContacts(prev => prev.filter(contact => contact.id !== contactToDelete.id));
            setShowDeleteModal(false);
            setContactToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setContactToDelete(null);
    };

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
            {/* Header */}
            <div className="px-6 pt-12 pb-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            Contacts
                        </h1>
                        <p className="text-slate-300 mt-1">{stats.total} contacts • {stats.online} online</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-slate-300 text-sm">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Star size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.favorites}</p>
                                <p className="text-slate-300 text-sm">Favorites</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <div className="w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.online}</p>
                                <p className="text-slate-300 text-sm">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-white/10 backdrop-blur-lg rounded-2xl p-1 mb-6">
                    {[
                        { id: 'all', label: 'All Contacts', icon: Users },
                        { id: 'favorites', label: 'Favorites', icon: Star },
                        { id: 'recent', label: 'Recent', icon: Clock }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contact List */}
            <div className="px-6 pb-6">
                <div className="space-y-3">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {contact.avatar}
                                        </div>
                                        {contact.status === 'online' && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white">{contact.name}</h3>
                                            {contact.isFavorite && (
                                                <Star size={16} className="text-yellow-400 fill-current" />
                                            )}
                                        </div>
                                        <p className="text-slate-300 text-sm">{contact.phone}</p>
                                        <p className="text-slate-400 text-xs">Last contact: {contact.lastContact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                                        <Phone size={16} className="text-green-400" />
                                    </button>
                                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                                        <MessageCircle size={16} className="text-blue-400" />
                                    </button>
                                    <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors">
                                        <Mail size={16} className="text-purple-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(contact)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                                    >
                                        <MoreVertical size={16} className="text-slate-400 group-hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No contacts found</h3>
                        <p className="text-slate-400">Try adjusting your search or add a new contact</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-110"
                >
                    <Plus size={24} className="text-white" />
                </button>
            </div>

            {/* Add Contact Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                Add New Contact
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <User size={16} className="inline mr-2" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Phone size={16} className="inline mr-2" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="+1 (555) 123-4567"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Mail size={16} className="inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <MapPin size={16} className="inline mr-2" />
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="123 Main St, City, State"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Birthday */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Calendar size={16} className="inline mr-2" />
                                        Birthday
                                    </label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Briefcase size={16} className="inline mr-2" />
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Company name"
                                    />
                                </div>
                            </div>

                            {/* Favorite Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="favorite"
                                    name="isFavorite"
                                    checked={formData.isFavorite}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <label htmlFor="favorite" className="text-slate-300 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-400" />
                                    Add to favorites
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-slate-300 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveContact}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && contactToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border border-white/20 shadow-2xl">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                <AlertTriangle size={32} className="text-red-400" />
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white mb-2">
                                Delete Contact
                            </h2>
                            <p className="text-slate-300 mb-2">
                                Are you sure you want to delete
                            </p>
                            <p className="text-white font-semibold">
                                {contactToDelete.name}?
                            </p>
                            <p className="text-slate-400 text-sm mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Contact Preview */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {contactToDelete.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-white text-sm">{contactToDelete.name}</h3>
                                    <p className="text-slate-300 text-xs">{contactToDelete.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-slate-300 font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagerHome;