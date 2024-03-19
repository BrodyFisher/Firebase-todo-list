// loads the input 
import { initializeApp } from 'firebase/app';
import { collection, addDoc, getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, EmailAuthProvider } from 'firebase/auth';
import './style.css';
import 'firebaseui/dist/firebaseui.css';
import * as firebaseui from 'firebaseui';

let freshDoc = true;
let todos = []; // will hold the to objects

// Firebase init

const firebaseConfig = {
    apiKey: "AIzaSyCvk-kvHQU4VKFTpvlmeXWClAI8Rt5VZLA",
    authDomain: "todo-list-6fb1e.firebaseapp.com",
    projectId: "todo-list-6fb1e",
    storageBucket: "todo-list-6fb1e.appspot.com",
    messagingSenderId: "450200435039",
    appId: "1:450200435039:web:9a595098dbd720f1f41eea",
    measurementId: "G-CKLRH9F5JJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ui = new firebaseui.auth.AuthUI(auth);

function displaySignIn() {

    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    // Remove the modal when the user clicks outside the widget
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });

    // Remove the modal when the user signs in
    auth.onAuthStateChanged(function(user) {
        if (user) {
            modal.remove();
        }
    });

    // 
    const widget = document.createElement('div');
    widget.id = "firebaseui-auth-container";
    widget.style.backgroundColor = "white";
    widget.style.padding = "1em";
    widget.style.maxWidth = "500px";
    widget.style.width = "80%";
    modal.appendChild(widget);

    document.body.appendChild(modal);

    ui.start('#firebaseui-auth-container', {

        signInOptions: [
            EmailAuthProvider.PROVIDER_ID
        ]
    });
}

async function newItem(message) {

    // default if user is not logged in
    let elemeId = 0;

    // user is logged in, set to uid
    if (auth.currentUser) {

        elemeId = auth.currentUser.uid;
    }

    let todo = {

        desc: message,
        completed: false,
        userId: elemeId
    };

    // write to the database if the user is logged in
    if (auth.currentUser) {
        try {
            const docRef = await addDoc(collection(db, 'todos'), todo);
            todo.docRef = docRef;
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    let element = document.createElement('li');
    element.className = "taskTodo";

    let checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.className = "completeBox";
    
    // adding the delete element function when something is marked complete
    checkBox.addEventListener("change", async function() {

        deleteItem(checkBox.parentNode);
    });

    element.textContent = todo.desc;
    element.appendChild(checkBox);

    return {element, todo};
}

async function deleteItem(liElement) {

    let removeObject = todos.find((node) => { // find the object to remove

        return node.element === liElement;
    });

    let index = todos.indexOf(removeObject); // get its index

    // delete from db if user is logged in
    if (auth.currentUser) {

        try {

            console.log(todos[index].todo.docRef.id);
            await deleteDoc(doc(db, 'todos', todos[index].todo.docRef.id));
        } catch (e) {

            console.log("Unable to delete document", e);
        } 
    }

    // delete list item
    liElement.parentNode.removeChild(liElement);

    if (index !== -1) {
        todos.splice(index, 1); // remove the object
    }
}

function theInput() {

    // main container
    const element = document.createElement('div');
    element.id = "outerInputDiv";

    const elem = document.createElement('div');
    elem.id = "innerInputDiv";

    // Text Element
    const p = document.createElement('p');
    p.id = "headerText";
    elem.appendChild(p);

    // input element
    const input = document.createElement('input');
    input.placeholder = "What's on your mind?";
    input.id = "theInput";

    input.addEventListener('keydown', function(event) {

        if (event.key == 'Enter') {

            // move the input and title to the top if this is the first time
            if (freshDoc) {
                // Get the outerInputDiv element
                let outerInputDiv = document.getElementById("outerInputDiv");
        
                // Add the 'top' class to outerInputDiv
                outerInputDiv.classList.add('top');

                // create a ul element to hold the todos and append it to the outer 
                // container for the list:
                const listContainer = document.createElement('div');
                listContainer.id = "listContainer";

                const list = document.createElement('ul');
                list.id = "theList";

                listContainer.appendChild(list);
                outerInputDiv.appendChild(listContainer);
        
                freshDoc = false;
            }
        
            // Get the message
            let textElement = document.getElementById("theInput").value;

            // don't want to create a blank task...
            if (textElement.length === 0) {

                window.alert("Cannot have a blank task!");
                return;
            }

            // make a new todo element and append to the list on screen
            newItem(textElement).then(newTodo => {
                document.getElementById("theList").appendChild(newTodo.element);
                todos.push(newTodo);
            });

            // clear the input
            document.getElementById('theInput').value = "";
        }
    });

    elem.appendChild(input);

    element.appendChild(elem);

    return element; // make sure to return the div instead of the input
}

function typeAnimation(text, element, delay = 100) {
    let index = 0;

    function addCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(addCharacter, delay);
        }
    }

    addCharacter();
}

function theNavBar() {

    let navBar = document.createElement('div');
    navBar.id = "navBar";

    let navButton = document.createElement('button');
    navButton.className = "navButton";
    navButton.textContent = "Sign In"

    navButton.addEventListener("click", displaySignIn);
    navBar.appendChild(navButton);

    return navBar;
}

// initial load is the input
let navBar = theNavBar();
document.body.appendChild(navBar);

let input = theInput();
document.body.appendChild(input);


let headerText = document.getElementById("headerText");

// now animate the beginning text on p
setTimeout(() => {
    typeAnimation("Let's get to work.", headerText);
}, 0);