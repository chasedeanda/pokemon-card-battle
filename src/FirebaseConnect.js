import firebase from 'firebase'
const config = {
    apiKey: "AIzaSyC_Gim0eEtIeL7S_1NqAJn7n1eh9nbaDXs",
    authDomain: "pokemon-card-battle.firebaseapp.com",
    databaseURL: "https://pokemon-card-battle.firebaseio.com",
    projectId: "pokemon-card-battle",
    storageBucket: "",
    messagingSenderId: "909435933155"
  };
firebase.initializeApp(config);
export default firebase;