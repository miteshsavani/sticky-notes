import { forwardRef } from 'react';
import './style.css';

const Note = forwardRef(({ note, handleMouseDown, removeNote }, ref) => {
	const { position, id } = note;
	return (
		<div
			className="note"
			ref={ref}
			style={{
				position: 'absolute',
				top: `${position?.y || 0}px`,
				left: `${position?.x || 0}px`,
				border: '1px solid black',
				padding: '10px',
				width: '200px',
				backgroundColor: 'lightyellow',
				color: 'black',
				cursor: 'move',
				userSelect: 'none',
				visibility: `${position?.x ? 'visible' : 'hidden'}`,
			}}
			onMouseDown={handleMouseDown}
		>
			📌 {note.text}
			<span className="removeIcon" onClick={() => removeNote(id)}>
				❌
			</span>
		</div>
	);
});

export default Note;
