import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    SafeAreaView,
    Alert,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Feather,
    AntDesign,
    Ionicons,

} from '@expo/vector-icons';
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase";

// Define the Contact type as in your original code
interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    isFavorite: boolean;
    lastContact: string;
    status: 'online' | 'offline';
    address: string;
    birthday: string;
    company: string;
}

const ContactManagerHome = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>();

    const [contacts, setContacts] = useState<Contact[]>([]);

    const [formData, setFormData] = useState<Contact>({
        id: '',
        name: '',
        phone: '',
        email: '',
        avatar: '',
        isFavorite: false,
        lastContact: '',
        status: 'online',
        address: '',
        birthday: '',
        company: ''
    });

    useEffect(() => {
        // Ensure user is authenticated before fetching data
        if (!auth.currentUser) {
            console.log("No authenticated user found.");
            return;
        }

        const contactsRef = collection(db, "contacts");
        const unsubscribe = onSnapshot(contactsRef, (querySnapshot) => {
            const allContacts = querySnapshot.docs
                .filter((doc) => doc.data().uId === auth.currentUser?.uid)
                .map(
                    (doc) =>
                        ({
                            ...doc.data(),
                            id: doc.id
                        } as Contact)
                );
            setContacts(allContacts);
        });

        // Cleanup function to stop listening to real-time updates
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

    const handleInputChange = (name: keyof Contact, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateAvatar = (name: string) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return name.substring(0, 2);
    };

    // Function to handle phone calls
    const handlePhoneCall = (phoneNumber: string) => {
        const cleanPhoneNumber = phoneNumber.replace(/[^+\d]/g, '');
        const phoneUrl = `tel:${cleanPhoneNumber}`;

        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(phoneUrl);
                } else {
                    Alert.alert('Error', 'Phone calls are not supported on this device');
                }
            })
            .catch((err) => {
                console.error('Error opening phone app:', err);
                Alert.alert('Error', 'Could not open phone app');
            });
    };

    // Function to handle SMS messaging
    const handleSendMessage = (phoneNumber: string, contactName: string) => {
        const cleanPhoneNumber = phoneNumber.replace(/[^+\d]/g, '');
        const smsUrl = `sms:${cleanPhoneNumber}`;

        Linking.canOpenURL(smsUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(smsUrl);
                } else {
                    Alert.alert('Error', 'SMS messaging is not supported on this device');
                }
            })
            .catch((err) => {
                console.error('Error opening messaging app:', err);
                Alert.alert('Error', 'Could not open messaging app');
            });
    };

    // Function to handle email
    const handleSendEmail = (email: string, contactName: string) => {
        if (!email || email.trim() === '') {
            Alert.alert('No Email', 'This contact does not have an email address');
            return;
        }

        const emailUrl = `mailto:${email}`;

        Linking.canOpenURL(emailUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(emailUrl);
                } else {
                    Alert.alert('Error', 'Email is not supported on this device');
                }
            })
            .catch((err) => {
                console.error('Error opening email app:', err);
                Alert.alert('Error', 'Could not open email app');
            });
    };

    const handleSaveContact = async () => {
        if (!formData.name.trim() || !formData.phone.trim()) {
            Alert.alert('Error', 'Name and phone number are required!');
            return;
        }

        const contactDataToSave = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            avatar: generateAvatar(formData.name.trim()).toUpperCase(),
            isFavorite: formData.isFavorite,
            lastContact: formData.lastContact,
            status: formData.status,
            address: formData.address.trim(),
            birthday: formData.birthday,
            company: formData.company.trim(),
            uId: auth.currentUser?.uid,
        };

        try {
            if (formData.id) {
                // Update existing contact
                const contactRef = doc(db, "contacts", formData.id);
                await setDoc(contactRef, contactDataToSave, { merge: true });
            } else {
                // Create new contact
                const newDocRef = doc(collection(db, "contacts"));
                await setDoc(newDocRef, { ...contactDataToSave, id: newDocRef.id });
            }
            closeModal();
        } catch (error) {
            console.error("Error saving contact", error);
            Alert.alert("Error", "Failed to save contact. Please try again.");
        }
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
            status: 'online',
            address: '',
            birthday: '',
            company: ''
        });
    };

    const handleEditClick = (contact: Contact) => {
        setFormData(contact);
        setShowModal(true);
    };

    const handleDeleteClick = (contact: Contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (contactToDelete) {
            try {
                await deleteDoc(doc(db, "contacts", contactToDelete.id));
            } catch (error) {
                console.error("Error deleting contact", error);
                Alert.alert("Error", "Failed to delete contact. Please try again.");
            }
            setShowDeleteModal(false);
            setContactToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setContactToDelete(null);
    };

    const renderContactCard = (contact: Contact) => (
        <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactCardContent}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={['#8b5cf6', '#ec4899']}
                        style={styles.avatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.avatarText}>{contact.avatar}</Text>
                    </LinearGradient>
                    {contact.status === 'online' && (
                        <View style={styles.onlineStatus} />
                    )}
                </View>
                <View style={styles.contactInfo}>
                    <View style={styles.contactNameRow}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        {contact.isFavorite && (
                            <AntDesign name="star" size={16} color="#fbbf24" style={{ marginLeft: 8 }} />
                        )}
                    </View>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={styles.contactLastContact}>Last contact: {contact.lastContact}</Text>
                </View>
            </View>
            <View style={styles.contactActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePhoneCall(contact.phone)}
                >
                    <Feather name="phone" size={16} color="#4ade80" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSendMessage(contact.phone, contact.name)}
                >
                    <Feather name="message-circle" size={16} color="#60a5fa" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSendEmail(contact.email, contact.name)}
                >
                    <Feather name="mail" size={16} color="#a855f7" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditClick(contact)} style={styles.actionButton}>
                    <Feather name="edit" size={16} color="#60a5fa" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteClick(contact)} style={styles.actionButton}>
                    <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#0f172a', '#5b21b6', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>Contacts</Text>
                            <Text style={styles.subtitle}>{stats.total} contacts • {stats.online} online</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={() => {
                            setFormData({
                                id: '',
                                name: '',
                                phone: '',
                                email: '',
                                avatar: '',
                                isFavorite: false,
                                lastContact: '',
                                status: 'online',
                                address: '',
                                birthday: '',
                                company: ''
                            });
                            setShowModal(true);
                        }}>
                            <Feather name="plus" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Feather name="users" size={20} color="#60a5fa" />
                            </View>
                            <View>
                                <Text style={styles.statNumber}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                        </View>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <AntDesign name="star" size={20} color="#fbbf24" />
                            </View>
                            <View>
                                <Text style={styles.statNumber}>{stats.favorites}</Text>
                                <Text style={styles.statLabel}>Favorites</Text>
                            </View>
                        </View>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <View style={styles.onlinePulse} />
                            </View>
                            <View>
                                <Text style={styles.statNumber}>{stats.online}</Text>
                                <Text style={styles.statLabel}>Online</Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search contacts..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>


                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {['all', 'favorites', 'recent'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                            >
                                <Feather
                                    name={tab === 'all' ? 'users' : tab === 'favorites' ? 'star' : 'clock'}
                                    size={16}
                                    color={activeTab === tab ? 'white' : '#cbd5e1'}
                                />
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                    {tab === 'all' ? 'All Contacts' : tab === 'favorites' ? 'Favorites' : 'Recent'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Contact List */}
                    <View style={styles.contactListContainer}>
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(renderContactCard)
                        ) : (
                            <View style={styles.noContactsContainer}>
                                <View style={styles.noContactsIconContainer}>
                                    <Feather name="users" size={40} color="#94a3b8" />
                                </View>
                                <Text style={styles.noContactsTitle}>No contacts found</Text>
                                <Text style={styles.noContactsText}>Try adjusting your search or add a new contact</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Floating Action Button */}
                <TouchableOpacity
                    onPress={() => {
                        setFormData({
                            id: '',
                            name: '',
                            phone: '',
                            email: '',
                            avatar: '',
                            isFavorite: false,
                            lastContact: '',
                            status: 'online',
                            address: '',
                            birthday: '',
                            company: ''
                        });
                        setShowModal(true);
                    }}
                    style={styles.fab}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>

                {/* Add/Edit Contact Modal */}
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{formData.id ? 'Edit Contact' : 'Add New Contact'}</Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                    <Feather name="x" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.formSection}>
                                    <Text style={styles.inputLabel}>
                                        <Feather name="user" size={16} color="#cbd5e1" /> Full Name *
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter full name"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.name}
                                        onChangeText={(value) => handleInputChange('name', value)}
                                    />
                                    <Text style={styles.inputLabel}>
                                        <Feather name="phone" size={16} color="#cbd5e1" /> Phone Number *
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="+1 (555) 123-4567"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.phone}
                                        onChangeText={(value) => handleInputChange('phone', value)}
                                        keyboardType="phone-pad"
                                    />
                                    <Text style={styles.inputLabel}>
                                        <Feather name="mail" size={16} color="#cbd5e1" /> Email Address
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="email@example.com"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.email}
                                        onChangeText={(value) => handleInputChange('email', value)}
                                        keyboardType="email-address"
                                    />
                                    <Text style={styles.inputLabel}>
                                        <Feather name="map-pin" size={16} color="#cbd5e1" /> Address
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="123 Main St, City, State"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.address}
                                        onChangeText={(value) => handleInputChange('address', value)}
                                    />
                                    <View style={styles.twoColumnInput}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.inputLabel}>
                                                <Feather name="calendar" size={16} color="#cbd5e1" /> Birthday
                                            </Text>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="YYYY-MM-DD"
                                                placeholderTextColor="#94a3b8"
                                                value={formData.birthday}
                                                onChangeText={(value) => handleInputChange('birthday', value)}
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={styles.inputLabel}>
                                                <Feather name="briefcase" size={16} color="#cbd5e1" /> Company
                                            </Text>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Company name"
                                                placeholderTextColor="#94a3b8"
                                                value={formData.company}
                                                onChangeText={(value) => handleInputChange('company', value)}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.checkboxContainer}>
                                        <TouchableOpacity
                                            onPress={() => handleInputChange('isFavorite', !formData.isFavorite)}
                                            style={[styles.checkbox, formData.isFavorite && styles.checkedCheckbox]}
                                        >
                                            {formData.isFavorite && (
                                                <Feather name="check" size={16} color="white" />
                                            )}
                                        </TouchableOpacity>
                                        <Text style={styles.checkboxLabel}>
                                            <Feather name="star" size={16} color="#fbbf24" /> Add to favorites
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact}>
                                    <Feather name="save" size={16} color="white" />
                                    <Text style={styles.saveButtonText}>
                                        {formData.id ? 'Save Changes' : 'Save Contact'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={showDeleteModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleDeleteCancel}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <View style={styles.deleteIconContainer}>
                                <Feather name="alert-triangle" size={32} color="#f87171" />
                            </View>

                            <View style={styles.deleteTextContainer}>
                                <Text style={styles.deleteTitle}>Delete Contact</Text>
                                <Text style={styles.deleteMessage}>Are you sure you want to delete</Text>
                                <Text style={styles.deleteContactName}>{contactToDelete?.name}?</Text>
                                <Text style={styles.deleteWarning}>This action cannot be undone.</Text>
                            </View>

                            <View style={styles.deletePreview}>
                                <LinearGradient
                                    colors={['#8b5cf6', '#ec4899']}
                                    style={styles.deleteAvatar}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.deleteAvatarText}>{contactToDelete?.avatar}</Text>
                                </LinearGradient>
                                <View style={styles.deleteInfo}>
                                    <Text style={styles.deletePreviewName}>{contactToDelete?.name}</Text>
                                    <Text style={styles.deletePreviewPhone}>{contactToDelete?.phone}</Text>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleDeleteCancel}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteConfirm}>
                                    <Feather name="trash-2" size={16} color="white" />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    headerContent: {
        // No style for gradient text in RN, using single color
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#e2e8f0', // Light purple-white color to mimic gradient
    },
    subtitle: {
        color: '#cbd5e1',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#8b5cf6', // A single color to represent the gradient
        padding: 12,
        borderRadius: 200,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5.46,
        elevation: 9,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIconContainer: {
        padding: 8,
        borderRadius: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    onlinePulse: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4ade80',
    },
    searchBarContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: 20,
        zIndex: 1,
    },
    searchInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        paddingLeft: 48,
        paddingRight: 16,
        paddingVertical: 16,
        color: 'white',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#8b5cf6', // Single color for gradient
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5.46,
        elevation: 9,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
    },
    activeTabText: {
        color: 'white',
    },
    contactListContainer: {
        gap: 12,
    },
    contactCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 16,
    },
    contactCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 16,
        height: 16,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#0f172a',
        borderRadius: 8,
    },
    contactInfo: {
        flex: 1,
    },
    contactNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactName: {
        fontWeight: '600',
        color: 'white',
        fontSize: 16,
    },
    contactPhone: {
        color: '#cbd5e1',
        fontSize: 14,
    },
    contactLastContact: {
        color: '#94a3b8',
        fontSize: 12,
    },
    contactActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    noContactsContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    noContactsIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    noContactsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    noContactsText: {
        color: '#94a3b8',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#8b5cf6',
        padding: 16,
        borderRadius: 30,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#e2e8f0',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    formSection: {
        gap: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
        marginBottom: 8,
    },
    textInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: 'white',
    },
    twoColumnInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedCheckbox: {
        backgroundColor: '#8b5cf6',
    },
    checkboxLabel: {
        color: '#cbd5e1',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#cbd5e1',
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5.46,
        elevation: 9,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    deleteModalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    deleteIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteTextContainer: {
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 24,
    },
    deleteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    deleteMessage: {
        color: '#cbd5e1',
        marginBottom: 4,
    },
    deleteContactName: {
        color: 'white',
        fontWeight: '600',
    },
    deleteWarning: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 8,
    },
    deletePreview: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    deleteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    deleteInfo: {
        flex: 1,
    },
    deletePreviewName: {
        fontWeight: '500',
        color: 'white',
        fontSize: 14,
    },
    deletePreviewPhone: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ef4444',
        borderRadius: 12,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5.46,
        elevation: 9,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '500',
    }
});

export default ContactManagerHome;