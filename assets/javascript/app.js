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

const nextArrival = (firstStop, rate) => {
  const now = JSON.parse(moment().format('X'))
  return moment(now + rate * 60 - (now - firstStop) % (rate * 60), 'X').format('HH:mm')
}

const updateTrainSchedule = arr => {
  document.querySelector('#train-table').innerHTML = ''
  arr.forEach(train => {
    console.log(train.data())
    const { name, destination, frequency, firstStop} = train.data()
    const minutesAway = frequency - Math.floor(((moment().format('X') - firstStop) % (frequency * 60)) / 60)
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

const isMilitaryTime = str => /([01]\d|2[0-3]):[0-5]\d/.test(str)

db.collection('trains')
  .onSnapshot(({ docs }) => updateTrainSchedule(docs))

document.querySelector('#add-btn').addEventListener('click', e => {
  e.preventDefault()
  let trainName = document.querySelector('#train-name').value,
      destination = document.querySelector('#destination').value,
      firstTime = document.querySelector('#first-time').value,
      frequency = document.querySelector('#frequency').value

  if (trainName && destination && isMilitaryTime(firstTime) && frequency > 0) {
    const firstStop = JSON.parse(moment(`${moment().format("MM/DD/YYYY")} ${firstTime}`, 'MM/DD/YYYY HH:mm').format('X'))
    db.collection('trains')
      .doc(trainName)
      .set({
        name: trainName,
        destination: destination,
        frequency: frequency,
        firstStop: firstStop
      })
    const inputs = document.getElementsByTagName('input')
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = ''
      inputs[i].classList.remove('valid')
    }
    const labels = document.getElementsByTagName('label')
    for (let i = 0; i < labels.length; i++) {
      labels[i].classList.remove('active')
    }
  }
})

const timer = setInterval(_ => {
  db.collection('trains')
    .get()
    .then(({ docs }) => updateTrainSchedule(docs))
    .catch(e => console.error(e))
}, 30000)
