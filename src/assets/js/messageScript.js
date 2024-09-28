// Firebase configuration (Replace with your own configuration)

const firebaseConfig = {
  apiKey: "AIzaSyCdCFCmHLNo2v8ArtU8cLShsBI5X84oZgc",
  authDomain: "website-1b123.firebaseapp.com",
  projectId: "website-1b123",
  storageBucket: "website-1b123.appspot.com",
  messagingSenderId: "869277703799",
  appId: "1:869277703799:web:12facbcc19ecba6b793072",
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
    db.collection("messages")
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
