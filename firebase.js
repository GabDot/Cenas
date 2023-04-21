// Import the functions you need from the SDKs you need
import * as firebase from 'firebase';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtHWx5a0Ay-0ilj1mlgtb0qxACBNLrMe8",
  authDomain: "areareservada-b5d8c.firebaseapp.com",
  projectId: "areareservada-b5d8c",
  storageBucket: "areareservada-b5d8c.appspot.com",
  messagingSenderId: "590857088944",
  appId: "1:590857088944:web:7eb8a1d734e1610b52b075"
};

// Initialize Firebase
let app;
if(firebase.apps.length == 0){
    app = firebase.initializeApp(firebaseConfig);

}
else{
    app=firebase.app();
}
const auth = firebase.auth();
const database = firebase.firestore();

export {database};
export {auth};
