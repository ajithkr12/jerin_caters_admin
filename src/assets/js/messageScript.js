// Firebase configuration (Replace with your own configuration)

const firebaseConfig = {
  apiKey: "AIzaSyCTT-7d9y-fXWAqN0wCNwT2VB1ezHZitt4",
  authDomain: "testproject-80d23.firebaseapp.com",
  databaseURL:
    "https://testproject-80d23-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testproject-80d23",
  storageBucket: "testproject-80d23.appspot.com",
  messagingSenderId: "675304146337",
  appId: "1:675304146337:web:17838009d1e7603fca77e0",
  measurementId: "G-4J3PT933SQ",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var storage = firebase.storage();
var currentEditId = null; // To track the document ID being edited

// Function to load and display data
function loadData() {
  var dataList = document.getElementById("data-list");
  dataList.innerHTML = ""; // Clear the list before loading new data

  db.collection("messages")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = doc.data();
        var listItem = document.createElement("div");
        listItem.classList.add("col-lg-12", "col-sm-12", "parent-card");
        listItem.innerHTML = `
        <div class="card-3">
        <div class="left-box">
          <div class="top-box">
            <p><strong>Sender Mail : </strong> ${data.senderMail}</p>
            <p>&nbsp; &nbsp;</p>
            <p><strong>Name : </strong> ${data.senderName}</p>
          </div>
  
          <p><strong>Subject : </strong> ${data.subject}</p>
          <p><strong>Message : </strong> ${data.message}</p>
        </div>
        <div class="right-box">
        <button class="edit-delete-button red-button" onclick="deleteData('${doc.id}')">Delete</button>
  
        </div>
      </div>`;

        dataList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

// Function to delete data
function deleteData(id) {
  if (confirm("Are you sure you want to delete this entry?")) {
    db.collection("gallery")
      .doc(id)
      .delete()
      .then(() => {
        alert("Data deleted successfully!");
        loadData(); // Refresh the data list after deletion
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  }
}

// Load data when the page loads
window.onload = loadData;
