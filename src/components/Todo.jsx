import React from 'react';
import { useDrag } from 'react-dnd';

const ToDo = ({ id, title, description, priority }) => {
 const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
 }));

 return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <h3>{title}</h3>
      <p>{description}</p>
      <p>{priority}</p>
    </div>
 );
};

export default ToDo;