import { createRef, useEffect } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import Note from '../note';
import './style.css';
import { v4 as uuidv4 } from 'uuid';

const intialNotes = [
	{ id: uuidv4(), text: 'First note part of initial notes' },
	{ id: uuidv4(), text: 'Second note part of initial notes' },
];

function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const notesKey = 'notes';

const getLocalStorageNotes = () => {
	const localNotes = localStorage.getItem(notesKey);

	if (localNotes) {
		return JSON.parse(localNotes);
	}
	return null;
};

const Notes = () => {
	const [notes, setNotes] = useState(getLocalStorageNotes() || intialNotes);
	const [textNote, setTextNote] = useState('');

	const noteRefs = useRef([]);
	const displayAreaRef = useRef(null);

	useEffect(() => {
		const isNoteWithoutPositionPresent =
			!!displayAreaRef.current && notes.some((note) => !note.position);
		if (isNoteWithoutPositionPresent) {
			const displayAreaRect = displayAreaRef.current.getBoundingClientRect();
			const updatedNotes = notes.map((note) => {
				if (note?.position) {
					return { ...note };
				}
				const x = randomInteger(
					displayAreaRect.left + 5,
					displayAreaRect.width - displayAreaRect.left - 205
				);
				const y = randomInteger(
					displayAreaRect.top + 5,
					displayAreaRect.height - displayAreaRect.top - 200
				);
				return { ...note, position: { x, y } };
			});
			setNotes(updatedNotes);
			localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
		}
		if (notes.length === 0) {
			localStorage.setItem(notesKey, JSON.stringify([]));
		}
	}, [notes]);

	const handleDragStart = (note, e) => {
		const clientX = e.clientX;
		const clientY = e.clientY;

		console.log(clientX, clientY);

		const noteRef = noteRefs.current[note.id].current;
		const currentNoteRect = noteRef.getBoundingClientRect();
		const displayAreaRect = displayAreaRef.current.getBoundingClientRect();

		const offsetX = clientX - currentNoteRect.left;
		const offsetY = clientY - currentNoteRect.top;

		const startPos = note.position;

		const handleMouseMove = (e) => {
			const newX = e.clientX - offsetX;
			const newY = e.clientY - offsetY;

			const allowNewPosition =
				newX - displayAreaRect.left > 1 &&
				newY - displayAreaRect.top > 1 &&
				newX + currentNoteRect.width <
					displayAreaRect.left + displayAreaRect.width &&
				newY + currentNoteRect.height <
					displayAreaRect.top + displayAreaRect.height;

			if (allowNewPosition) {
				noteRef.style.left = `${newX}px`;
				noteRef.style.top = `${newY}px`;
			}
		};
		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);

			const finalRect = noteRef.getBoundingClientRect();
			const newPosition = { x: finalRect.left, y: finalRect.top };

			if (checkForOverLap(note.id)) {
				noteRef.style.left = `${startPos.x}px`;
				noteRef.style.top = `${startPos.y}px`;
			} else {
				updateNotePosition(note.id, newPosition);
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const checkForOverLap = useCallback(
		(id) => {
			const currentNoteRef = noteRefs.current[id].current;
			const currentRect = currentNoteRef.getBoundingClientRect();

			return notes.some((note) => {
				if (note.id === id) return false;

				const otherNoteRef = noteRefs.current[note.id].current;
				const otherRect = otherNoteRef.getBoundingClientRect();

				const overlap = !(
					currentRect.right < otherRect.left ||
					currentRect.left > otherRect.right ||
					currentRect.bottom < otherRect.top ||
					currentRect.top > otherRect.bottom
				);
				return overlap;
			});
		},
		[notes]
	);

	const updateNotePosition = useCallback(
		(id, newPosition) => {
			const updatedNotes = notes.map((note) =>
				note.id === id ? { ...note, position: newPosition } : note
			);

			setNotes(updatedNotes);
			localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
		},
		[notes]
	);

	const onTextNoteChange = useCallback((e) => {
		setTextNote(e.target.value);
	}, []);

	const onButtonClick = useCallback(() => {
		setNotes((currentNotes) => [
			...currentNotes,
			{ id: uuidv4(), text: textNote },
		]);
		setTextNote('');
	}, [textNote]);

	const removeNote = useCallback(
		(id) => {
			const updatedNotes = notes.filter((note) => note.id !== id);
			setNotes(updatedNotes);
			localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
		},
		[notes]
	);

	return (
		<>
			<div className="inputBlock">
				<textarea value={textNote} onChange={onTextNoteChange} />
				<button
					type="button"
					onClick={onButtonClick}
					disabled={!textNote.length}
				>
					Add Note
				</button>
			</div>
			<div className="displayNotesArea" ref={displayAreaRef}>
				{notes.map((note) => {
					return (
						<Note
							key={note.id}
							note={note}
							ref={
								noteRefs.current[note.id]
									? noteRefs.current[note.id]
									: (noteRefs.current[note.id] = createRef())
							}
							removeNote={removeNote}
							handleMouseDown={(e) => handleDragStart(note, e)}
						/>
					);
				})}
			</div>
		</>
	);
};

export default Notes;
