// firebase/contacts.ts
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import {auth, db} from "@/firebase";
import {Contact} from "@/types/contact";

export const contactRef = collection(db, "contacts");

// CREATE
export const saveContact = async (contact: Contact) => {
    try {
        const uId = auth.currentUser?.uid; // get only the UID string
        if (!uId) throw new Error("No logged-in user");

        const docRef = await addDoc(contactRef, { ...contact, uId });
        return docRef;
    } catch (error) {
        console.error("Error saving contact", error);
    }
};


// READ
export const fetchContacts = async () => {
    try {
        const snapshot = await getDocs(contactRef);
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return contacts;
    } catch (error) {
        console.error("Error fetching contacts", error);
    }
};

// UPDATE
export const updateContact = async (id: string, data: Contact) => {
    try {
        const docRef = doc(db, "contacts", id);
        const { id: _id, ...contactData } = data;
        await updateDoc(docRef, contactData);
    } catch (error) {
        console.error("Error updating contact", error);
    }
};

// DELETE
export const deleteContact = async (id: string) => {
    try {
        const docRef = doc(db, "contacts", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting contact", error);
    }
};
