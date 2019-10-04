// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa4WTY--hLOfMFaQaoAzmnsCHv9cpRa7s",
  authDomain: "train-scheduler-9bffd.firebaseapp.com",
  databaseURL: "https://train-scheduler-9bffd.firebaseio.com",
  projectId: "train-scheduler-9bffd",
  storageBucket: "",
  messagingSenderId: "331507088771",
  appId: "1:331507088771:web:309189ad5d7669e31fcab6",
  measurementId: "G-Q8NMLLX9VK"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore()
// Return next arrival of train in military time format
const nextArrival = (firstStop, rate) => {
  const now = JSON.parse(moment().format('X'))
  // Time, in seconds, since last arrival
  const lastArrival = (now - firstStop) % (rate * 60)
  // Find next arrival by removing lastArrival and adding rate of train
  return moment(now + rate * 60 - lastArrival, 'X').format('HH:mm')
}

// Update train schedule on html
const updateTrainSchedule = trains => {
  // Clear schedule
  document.querySelector('#train-table').innerHTML = ''
  trains.forEach(train => {
    // Grab all data from train
    const { name, destination, frequency, firstStop} = train.data()
    // Compute how long till train arrives
    const minutesAway = frequency - Math.floor(((moment().format('X') - firstStop) % (frequency * 60)) / 60)
    // Add train to schedule
    document.querySelector('#train-table').innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${destination}</td>
        <td>${frequency}</td>
        <td>${nextArrival(firstStop, frequency)}</td>
        <td>${minutesAway}</td>
      </tr>`
  })
}

// Chcek if str contains military time
const isMilitaryTime = str => /([01]\d|2[0-3]):[0-5]\d/.test(str)

// Update schedule if trains is modified
db.collection('trains')
  .onSnapshot(({ docs }) => updateTrainSchedule(docs))

// Add train to schedule
document.querySelector('#add-btn').addEventListener('click', e => {
  // Prevent form from reloading page
  e.preventDefault()
  // Grab all input from form
  let trainName = document.querySelector('#train-name').value,
      destination = document.querySelector('#destination').value,
      firstTime = document.querySelector('#first-time').value,
      frequency = document.querySelector('#frequency').value
  // Check if there exists input and if it is valid
  if (trainName && destination && isMilitaryTime(firstTime) && frequency > 0) {
    // Set firstStop to be today at firstTime
    const firstStop = JSON.parse(moment(`${moment().format("MM/DD/YYYY")} ${firstTime}`, 'MM/DD/YYYY HH:mm').format('X'))
    // Add to database
    db.collection('trains')
      .doc(trainName)
      .set({
        name: trainName,
        destination: destination,
        frequency: frequency,
        firstStop: firstStop
      })
    // Update inputs to empty
    const inputs = document.getElementsByTagName('input')
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = ''
      inputs[i].classList.remove('valid')
    }
    // Update input labels
    const labels = document.getElementsByTagName('label')
    for (let i = 0; i < labels.length; i++) {
      labels[i].classList.remove('active')
    }
  }
})

// Update schedule every 30 seconds
const timer = setInterval(_ => {
  db.collection('trains')
    .get()
    .then(({ docs }) => updateTrainSchedule(docs))
    .catch(e => console.error(e))
}, 30000)
