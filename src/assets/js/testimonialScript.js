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

// Submit form data to Firebase
document.getElementById("data-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const content = document.getElementById("content").value;
  const name = document.getElementById("name").value;
  const position = document.getElementById("position").value;
  const companyName = document.getElementById("companyName").value;
  const image = document.getElementById("image").files[0];

  const form = document.getElementById("data-form");
  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("upload-progress");
  const progressPercentage = document.getElementById("progress-percentage");

  if (currentEditId) {
    // Edit existing document
    updateDocument(
      currentEditId,
      content,
      name,
      position,
      companyName,
      image,
      form,
      progressContainer,
      progressBar,
      progressPercentage
    );
  } else {
    // Add new document
    if (image) {
      // Show progress bar
      progressContainer.style.display = "block";

      // Upload image to Firebase Storage
      var storageRef = storage.ref("images/" + image.name);
      var uploadTask = storageRef.put(image);

      uploadTask.on(
        "state_changed",
        function (snapshot) {
          // Calculate and update upload progress
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.value = progress;
          progressPercentage.textContent = Math.round(progress) + "%";
        },
        function (error) {
          console.error("Error uploading image: ", error);
        },
        function () {
          // Upload completed successfully, get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // Save form data along with image URL to Firestore
            db.collection("testimonials")
              .add({
                content: content,
                name: name,
                position: position,
                companyName: companyName,
                imageUrl: downloadURL,
              })
              .then(() => {
                alert("Data saved successfully!");
                form.reset(); // Clear form fields after submission
                progressContainer.style.display = "none"; // Hide progress bar
                progressBar.value = 0; // Reset progress bar
                progressPercentage.textContent = "0%"; // Reset progress text
                loadData(); // Refresh the data list after saving new data
              })
              .catch((error) => {
                console.error("Error writing document: ", error);
              });
          });
        }
      );
    } else {
      alert("Please select an image.");
    }
  }
});

// Function to update a document
function updateDocument(
  id,
  content,
  name,
  position,
  companyName,
  image,
  form,
  progressContainer,
  progressBar,
  progressPercentage
) {
  if (image) {
    // Show progress bar
    progressContainer.style.display = "block";

    // Upload new image to Firebase Storage
    var storageRef = storage.ref("images/" + image.name);
    var uploadTask = storageRef.put(image);

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Calculate and update upload progress
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = progress;
        progressPercentage.textContent = Math.round(progress) + "%";
      },
      function (error) {
        console.error("Error uploading image: ", error);
      },
      function () {
        // Upload completed successfully, get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          // Update document with new data
          db.collection("users")
            .doc(id)
            .update({
              content: content,
              name: name,
              position: position,
              companyName: companyName,
              imageUrl: downloadURL,
            })
            .then(() => {
              alert("Data updated successfully!");
              form.reset(); // Clear form fields after submission
              progressContainer.style.display = "none"; // Hide progress bar
              progressBar.value = 0; // Reset progress bar
              progressPercentage.textContent = "0%"; // Reset progress text
              currentEditId = null; // Reset edit ID
              loadData(); // Refresh the data list after updating
            })
            .catch((error) => {
              console.error("Error updating document: ", error);
            });
        });
      }
    );
  } else {
    // Update document without changing the image
    db.collection("testimonials")
      .doc(id)
      .update({
        content: content,
        name: name,
        position: position,
        companyName: companyName,
      })
      .then(() => {
        alert("Data updated successfully!");
        form.reset(); // Clear form fields after submission
        currentEditId = null; // Reset edit ID
        loadData(); // Refresh the data list after updating
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }
}

// Function to load and display data
function loadData() {
  var dataList = document.getElementById("data-list");
  dataList.innerHTML = ""; // Clear the list before loading new data

  db.collection("testimonials")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = doc.data();
        var listItem = document.createElement("div");
        listItem.classList.add("col-lg-4", "col-sm-4", "parent-card");

        listItem.innerHTML = `
          <div class="card-1">
            <div class="content-box">
              <div class="imgbox">
                <img
                  src="${data.imageUrl}"
                  alt=""
                />
              </div>
              <div class="detbox">
                <p class="name">${data.name}</p>
                <p class="designation">
                ${data.position} -- ${data.companyName}
                </p>
              </div>
            </div>
            <div class="review">
              <h4>${data.content}</h4>
            </div>
            <div class="">
            <button class="edit-delete-button green-button" onclick="editData('${doc.id}', '${data.content}', '${data.name}', '${data.position}','${data.companyName}')">Edit</button>
            <button class="edit-delete-button red-button" onclick="deleteData('${doc.id}','${data.imageUrl}')">Delete</button>
          </div>
        </div>`;

        dataList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

// Function to edit data
function editData(id, content, name, position, companyName) {
  document.getElementById("content").value = content;
  document.getElementById("name").value = name;
  document.getElementById("position").value = position;
  document.getElementById("companyName").value = companyName;
  currentEditId = id; // Set the current document ID to edit
}

// Function to delete data
function deleteData(id, imageUrl) {
  if (confirm("Are you sure you want to delete this entry?")) {
    const fileRef = storage.refFromURL(imageUrl);
    // Delete the file using the delete() method
    fileRef
      .delete()
      .then(function () {
        // File deleted successfully
        console.log("File Deleted");
      })
      .catch(function (error) {
        // Some Error occurred
      });

    db.collection("testimonials")
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
