// lib/firebaseAuth.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const fetchCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe(); // Stop listening after we get the first result
                resolve(user);
            },
            reject
        );
    });
};