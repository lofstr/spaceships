import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

/* -------------------- Config -------------------- */

const firebaseConfig = {
  apiKey: "AIzaSyDlWUdUdE7ipYaGaqjWcrkwduomH_Qc3YQ",
  authDomain: "visma-demo-d7a81.firebaseapp.com",
  projectId: "visma-demo-d7a81",
  storageBucket: "visma-demo-d7a81.appspot.com",
  messagingSenderId: "296219819152",
  appId: "1:296219819152:web:086cf9372b8f94a47a2c15",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();

const LEVELS = 3;
const PARKING_SPACE = 15;

/* -------------------- Main Functions --------------------*/
export const getNumberOfLevels = () => {
  var level = 0;
  var garageRef = db.collection("garage").orderBy("level", "desc").limit(1);
  return garageRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log("LEVEL: ", doc.data().level);
      level = doc.data().level;
    });
    return level;
  });
};

export const initParkinglot = (levels = LEVELS, slots = PARKING_SPACE) => {
  return getNumberOfLevels().then((r) => {
    if (levels === r) {
      console.log("Already have that many garage levels.");
      return false;
    } else {
      for (let index = 0; index < levels; index++) {
        db.collection("garage")
          .add({
            level: index + 1,
            space: slots,
          })
          .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            addParkingSlots(docRef.id, PARKING_SPACE);
            return true;
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
            return false;
          });
      }
    }
  });
};

export const addParkingSlots = (docRef, n) => {
  for (let index = 0; index < n; index++) {
    db.collection("garage")
      .doc(docRef)
      .collection("parking")
      .add({
        spot: index + 1,
        parked: null,
        date: null,
      });
  }
};

export const unRegisterPark = (regNr) => {
  return findReg(regNr).then((result) => {
    if (result) {
      let cost = 0;
      const parkRef = db.doc(result);
      return parkRef
        .get()
        .then((querySnapshot) => {
          cost = calcCost(querySnapshot.data().date, new Date());
          return logParking(querySnapshot.data());
        })
        .then(() => {
          parkRef.update({
            parked: null,
            date: null,
          });
          return `Car is now unregistered! Cost amounts to ${cost}$`;
        });
    } else {
      return "No car with that registration number is parked.";
    }
  });
};

// Park
export const park = (regNr) => {
  if (!regNr) return "No registration number was entered";
  return findReg(regNr).then((result) => {
    // Checks if Car is already registered.
    if (result) {
      return "Car already parked";
    } else {
      // If not, Continue.
      var carParked = false;
      return db
        .collection("garage")
        .get()
        .then((garageLevelSnapshot) => {
          // Go through all garage levels. See if there are any empty slots.
          const p = [];
          garageLevelSnapshot.forEach((level) => {
            // Could use other loop to break earlier to save data.
            // --> Only read 15 at a time until match.
            p.push(findEmptySlot(level.id));
          });
          return Promise.all(p);
        })
        .then((result) => {
          // If there are any empty slots. Add a car and return true.
          // Return alse otherwise
          result = result.flat();
          if (result.length !== 0 && carParked === false) {
            return addCar(result[0].level, result[0].spotId, regNr).then(
              (params) => {
                return true;
              }
            );
          } else {
            console.log("Failed to park car. No more room in garage.");
            return false;
          }
        })
        .catch((error) => {
          console.log("Error getting garage info: ", error);
        });
    }
  });
};

/*-------------------- Helper functions --------------------*/
const calcCost = (parkDate, leaveDate) => {
  // + 1 for every started hour.
  var hours = Math.round(Math.abs(parkDate.toDate() - leaveDate) / 36e6) + 1;

  if (hours >= 24) return 50;
  else if (hours <= 0) return 15;
  else return Math.round(hours * 15);
};

const logParking = (data) => {
  return db.collection("log").add({
    spot: data.spot,
    regNr: data.parked,
    pickupdate: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

const findReg = (regNr) => {
  // Kolla om reg är > 1 och rapportera fel !!!
  //-----------------------------------
  // Returns path for regNr if parked.
  const unregRef = db.collectionGroup("parking").where("parked", "==", regNr);
  return unregRef.get().then((querySnapshot) => {
    let match = "";
    querySnapshot.forEach((doc) => {
      match = doc.ref.path;
    });
    return match;
  });
};

const addCar = (garageId, spotId, regNr) => {
  // Uppdates the garage for specified IDs to contain a parked car.
  const parkRef = db
    .collection("garage")
    .doc(garageId)
    .collection("parking")
    .doc(spotId);

  return parkRef
    .update({
      parked: regNr,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log("Successfully parked a car");
      return true;
    })
    .catch((error) => {
      console.log("Error parking a car: ", error);
    });
};

const findEmptySlot = (docId) => {
  // Returns reference to all empty parking slots.
  var data = [];
  const slotRef = db
    .collection("garage")
    .doc(docId)
    .collection("parking")
    .where("parked", "==", null);

  return slotRef
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push({ spot: doc.data().spot, level: docId, spotId: doc.id });
      });
      return data;
    })
    .catch((error) => {
      console.log("Error getting parking slots: ", error);
    });
};
