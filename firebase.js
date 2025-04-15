import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBsjt-Q9Kshyx5dRCQi2wYEG3t8xGLDtZM',
  authDomain: 'agriya-fc4ef.firebaseapp.com',
  projectId: 'agriya-fc4ef',
  storageBucket: 'agriya-fc4ef.appspot.com',
  messagingSenderId: '603553863701',
  appId: '1:603553863701:android:a25c9552b3e5b002f6961c',
  databaseURL: 'https://agriya-fc4ef-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
