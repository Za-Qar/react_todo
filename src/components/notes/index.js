import React, { useState, useRef, useEffect } from "react";
import { confirmAlert } from "react-confirm-alert";
import { motion } from "framer-motion";
import "./notes.css";
import { BACKEND_URLS } from "../../configs/configs";

import Note from "../note";

// Encryption
import CryptoJS from "react-native-crypto-js";

function Notes() {
  const area = useRef(null);
  const [titleInput, setTitleInput] = useState("");
  const [textInput, setTextInput] = useState("");

  const [retrieveAllNote, setRetrieveAllNotes] = useState([]);

  const [getNewNoteId, setNewNoteId] = useState(0);

  const [colour, setColour] = useState("whiteNote");

  /*---------------Add Note----------------*/
  let postNote = (title, text, colour) => {
    // Encrypt
    const encryptedTitle = CryptoJS.AES.encrypt(
      `${title}`,
      `${process.env.ENCRYPTION_HASH}`
    ).toString();

    // Encrypt
    const encryptedText = CryptoJS.AES.encrypt(
      `${text}`,
      `${process.env.ENCRYPTION_HASH}`
    ).toString();

    // Encrypt
    const encryptedColour = CryptoJS.AES.encrypt(
      `${colour}`,
      `${process.env.ENCRYPTION_HASH}`
    ).toString();

    fetch(`${BACKEND_URLS.NOTES}`, {
      method: "POST",
      body: JSON.stringify({
        title: encryptedTitle,
        text: encryptedText,
        colour: encryptedColour,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setNewNoteId(data[0].id))
      .catch((error) => console.log("Notes error: ", error));
  };

  /*---------------Retrieve all notes----------------*/
  async function retrieveAllNotes() {
    let res = await fetch(`${BACKEND_URLS.NOTES}`);
    let data = await res.json();

    const decrypting = data.payload.map((item) => {
      // Decrypt
      const decryptingColour = CryptoJS.AES.decrypt(
        `${item.color}`,
        `${process.env.ENCRYPTION_HASH}`
      );
      const decryptedColour = decryptingColour.toString(CryptoJS.enc.Utf8);

      // Decrypt
      const decryptingText = CryptoJS.AES.decrypt(
        `${item.text}`,
        `${process.env.ENCRYPTION_HASH}`
      );
      const decryptedText = decryptingText.toString(CryptoJS.enc.Utf8);

      // Decrypt
      const decryptingTitle = CryptoJS.AES.decrypt(
        `${item.title}`,
        `${process.env.ENCRYPTION_HASH}`
      );
      const decryptedTitle = decryptingTitle.toString(CryptoJS.enc.Utf8);

      return {
        color: decryptedColour,
        id: item.id,
        text: decryptedText,
        title: decryptedTitle,
        status: item.status,
      };
    });

    console.log("these are all the notes on the database: ", data.payload);
    setRetrieveAllNotes(decrypting);
  }

  useEffect(() => {
    retrieveAllNotes();
  }, []);

  /*---------------Delete note----------------*/
  let deleteNoteBackend = (id) => {
    fetch(`${BACKEND_URLS.NOTES}/${id}`, {
      method: "delete",
    })
      .then((res) => res.json())
      .then((data) => console.log(data, "Note has been delete buddy boy"))
      .catch((error) => console.log(error, "this is the delete note error"));
  };

  /*--------------------Notes backend end----------------------*/

  async function addNote() {
    console.log("this should be the note's colour: ", colour);
    setRetrieveAllNotes([
      ...retrieveAllNote,
      { title: titleInput, text: textInput, color: colour, id: getNewNoteId },
    ]);
    postNote(titleInput, textInput, colour);
    setTitleInput("");
    setTextInput("");
  }

  function deleteNote(noteId) {
    confirmAlert({
      title: "Are you sure you want to delete this notes?",
      message: "This action is irreversible",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            // let newNotes = [
            //   ...retrieveAllNote.slice(0, id),
            //   ...retrieveAllNote.slice(id + 1),
            // ];
            setRetrieveAllNotes(
              retrieveAllNote.filter((note) => note.id !== noteId)
            );

            deleteNoteBackend(noteId);
            // retrieveAllNotes();
            // setHide("hide");
          },
        },
        {
          label: "No",
          onClick: () => {
            return;
          },
        },
      ],
    });
  }

  return (
    <div className="container">
      <div className="notesSec">
        <div className="notesInput">
          <input
            placeholder="Title"
            className="inputFieldNotesLeft"
            onChange={(e) => setTitleInput(e.target.value)}
            value={titleInput}
          />
          <input
            placeholder="Text"
            className="inputFieldNotesRight"
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          />
        </div>
        <div className="colour">
          <h4>Choose a colour</h4>
          <span className="column in1">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("whiteNote")}
            />
          </span>
          <span className="column in2">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("greenNote")}
            />
          </span>
          <span className="column in3">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("redNote")}
            />
          </span>
          <span className="column in4">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("purpleNote")}
            />
          </span>
          <span className="column in5">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("peachNote")}
            />
          </span>

          <span className="column in6">
            <input
              className="allColumns"
              name="colour"
              type="radio"
              onChange={() => setColour("blueNote")}
            />
          </span>
        </div>
        <button className="addNoteButton" onClick={addNote}>
          Add Note
        </button>
        <motion.div className="drag-area" ref={area}>
          {retrieveAllNote.map((item, index) => {
            return (
              <Note
                area={area}
                noteTitle={item.title}
                noteText={item.text}
                index={index}
                deleteNote={deleteNote}
                noteId={getNewNoteId ? getNewNoteId : item.id}
                key={index}
                colour={item.color}
              />
            );
          })}
          {/*noteText={noteText}*/}
          {/* {note.map((item, index) => {
            return (
              <Note
                area={area}
                noteTitle={item.title}
                noteText={item.text}
                index={index}
                deleteNote={deleteNote}
                noteId={getNewNoteId}
                key={index}
                colour={item.colour}
                hide={hide}
              />
            );
          })} */}
        </motion.div>
      </div>
    </div>
  );
}

export default Notes;
