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

// Submit form data to Firebase
document.getElementById("data-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const content = document.getElementById("content").value;
  const heading = document.getElementById("heading").value;
  // const subHeading = document.getElementById("subHeading").value;
  const categoryName = document.getElementById("categoryName").value;
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
      heading,
      // subHeading,
      categoryName,
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
            db.collection("menu_list")
              .add({
                content: content,
                heading: heading,
                // subHeading: subHeading,
                categoryName: categoryName,
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
  heading,
  // subHeading,
  categoryName,
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
          db.collection("menu_list")
            .doc(id)
            .update({
              content: content,
              heading: heading,
              // subHeading: subHeading,
              categoryName: categoryName,
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
    db.collection("menu_list")
      .doc(id)
      .update({
        content: content,
        heading: heading,
        // subHeading: subHeading,
        categoryName: categoryName,
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

  db.collection("menu_list")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = doc.data();
        var listItem = document.createElement("div");
        listItem.classList.add("col-lg-4", "col-sm-4", "parent-card");
        listItem.innerHTML = `
        <div class="card-2">
        <div class="card">
          <div
            class="thumb"
            style="
              background-image: url(${data.imageUrl});
            "
          ></div>
          <article>
            <h1> ${data.heading} - <span> ${data.categoryName}</span></h1>
            <p>
            ${data.content}
            </p>
            <div class="">
            <button class="edit-delete-button green-button" 
            data-id="${doc.id}" 
            data-content="${data.content.replace(/"/g, "&quot;")}" 
            data-heading="${data.heading}" 
            data-categoryName="${data.categoryName}">Edit</button>



            <button class="edit-delete-button red-button" onclick="deleteData('${
              doc.id
            }','${data.imageUrl}')">Delete</button>
            </div>
          </article>
        </div>
      </div>`;

        dataList.appendChild(listItem);

        listItem
          .querySelector(".edit-delete-button.green-button")
          .addEventListener("click", function () {
            editData(
              this.getAttribute("data-id"),
              this.getAttribute("data-content"),
              this.getAttribute("data-heading"),
              this.getAttribute("data-categoryName")
            );
          });
      });
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

// Function to edit data
function editData(id, content, heading, categoryName) {
  document.getElementById("content").value = content;
  document.getElementById("heading").value = heading;
  document.getElementById("categoryName").value = categoryName;
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

    db.collection("menu_list")
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
