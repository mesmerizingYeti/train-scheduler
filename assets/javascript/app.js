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

db.collection('trains')
  .get()
  .then(({ docs }) => {
    docs.forEach(train => {
      console.log(train.data())
      let { name, destination, frequency, firstStop} = train.data()
      let minutesAway = frequency - Math.floor(((moment().format('X') - firstStop) % (frequency * 60)) / 60)
      document.querySelector('#train-table').innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${destination}</td>
          <td>${frequency}</td>
          <td>${nextArrival(firstStop, frequency)}</td>
          <td>${minutesAway}</td>
        </tr>`
    })
  })

document.querySelector('#add-btn').addEventListener('click', e => {
  e.preventDefault()
  
})
