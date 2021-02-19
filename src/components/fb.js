import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

/* ------------------------- Config ------------------------- */

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

const LEVELS = 3; // Floors on the parkinggarage
const PARKING_SPACE = 15; // Slots per floor in the parkingarage

/* ------------------------- Main Functions -------------------------*/
export const getNumberOfLevels = () => {
  // Returns the number of levels on the parking garage (Default 3).
  var garageRef = db.collection("garage").orderBy("level", "desc").limit(1);
  return garageRef.get().then((querySnapshot) => {
    let level = 0;
    querySnapshot.forEach((doc) => {
      //console.log("LEVEL: ", doc.data().level);
      level = doc.data().level;
    });
    return level;
  });
};

export const initParkinglot = (levels = LEVELS, slots = PARKING_SPACE) => {
  // Creates as many floors as inputed in LEVELS.
  // Is not dynamic and check is currently in place to avoid multiple setups.
  // If changing LEVELS you need to purge collection.
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
  // Creates collection with n=PARKING_SPACE number of documents in each document in garage.
  // i.e. adds 15 parking spaces to each floor in the garage.
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
  // Checks if regNr exists and if so removes spaceship from parking lot,
  // ...calculates cost and then creates a log of event.
  return findReg(regNr).then((spaceshipRef) => {
    if (spaceshipRef) {
      let cost = 0;
      const parkRef = db.doc(spaceshipRef);
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
          return `spaceship is now unregistered! Cost amounts to ${cost}$`;
        });
    } else {
      return "No spaceship with that registration number is parked.";
    }
  });
};

export const park = (regNr) => {
  // Adds the specified regNr to any random available space in the parking garage.
  // Checks if regNr already parked and if parking garage is full.
  return findReg(regNr).then((result) => {
    // Checks if spaceship is already registered.
    if (result) {
      return "spaceship already parked";
    } else {
      // If not, Continue.
      var spaceshipParked = false;
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
          // If there are any empty slots. Add a spaceship and return true.
          // Return alse otherwise
          result = result.flat();
          if (result.length !== 0 && spaceshipParked === false) {
            return addSpaceship(result[0].level, result[0].spotId, regNr).then(
              (params) => {
                return true;
              }
            );
          } else {
            console.log("Failed to park spaceship. No more room in garage.");
            return false;
          }
        })
        .catch((error) => {
          console.log("Error getting garage info: ", error);
        });
    }
  });
};

/*------------------------- Helper functions -------------------------*/

const calcCost = (parkDate, leaveDate) => {
  // If parked more than 24 hours, it will only charge additional at next day, i.e. at 48 hours etc.
  var difference = parkDate.toDate().getTime() - leaveDate.getTime();
  var hoursDifference = Math.abs(Math.floor(difference / 1000 / 60 / 60));
  // How many 24hour cycles have spaceship been parked.
  if (hoursDifference >= 24) return Math.floor(hoursDifference / 24) * 50;
  else if (hoursDifference <= 0) return 15;
  else return Math.round(hoursDifference * 15); // Maybe omit rounding, depending on implementation.
};

const logParking = (parkedSpaceship) => {
  // Adds a document with parking information to the log-collection.
  // Occurs on spaceship-pickup.
  return db.collection("log").add({
    spot: parkedSpaceship.spot,
    regNr: parkedSpaceship.parked,
    pickUpDate: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

const findReg = (regNr) => {
  // Returns document path for regNr if parked.
  const unregRef = db.collectionGroup("parking").where("parked", "==", regNr);
  return unregRef.get().then((querySnapshot) => {
    if (querySnapshot.size >= 2)
      // Error handler - If two spaceships with same reg are parked.
      console.log(
        `Possible error, found ${querySnapshot.size} spaceships with same registration number parked.`
      );
    let match = "";
    querySnapshot.forEach((doc) => {
      match = doc.ref.path;
    });
    return match;
  });
};

const addSpaceship = (garageId, spotId, regNr) => {
  // Uppdates the garage for specified IDs to contain a parked spaceship.
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
      console.log("Successfully parked a spaceship");
      return true;
    })
    .catch((error) => {
      console.log("Error parking a spaceship: ", error);
    });
};

const findEmptySlot = (docId) => {
  // Returns reference to all empty parking slots.
  var emptySlots = [];
  const slotRef = db
    .collection("garage")
    .doc(docId)
    .collection("parking")
    .where("parked", "==", null);

  return slotRef
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        emptySlots.push({
          spot: doc.data().spot,
          level: docId,
          spotId: doc.id,
        });
      });
      return emptySlots;
    })
    .catch((error) => {
      console.log("Error getting parking slots: ", error);
    });
};
