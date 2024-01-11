import React, { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { doc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");

  const addTask = async () => {
    if (taskTitle && taskDescription && taskDueDate && taskPriority) {
      try {
        const taskRef = await addDoc(collection(db, "tasks"), {
          title: taskTitle,
          description: taskDescription,
          dueDate: taskDueDate,
          priority: taskPriority,
        });

        const newTask = {
          id: taskRef.id,
          title: taskTitle,
          description: taskDescription,
          dueDate: taskDueDate,
          priority: taskPriority,
        };
        setTasks([...tasks, newTask]);
      } catch (error) {
        console.error("Error adding task to Firestore:", error);
      }

      // Clear input fields after adding a task
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskPriority("");
    } else {
      alert("Please fill in all task details.");
    }
  };

  const removeTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      console.log("Document successfully deleted from db with id: ", taskId);
    } catch (error) {
      console.error("Error removing task from Firestore:", error);
    }
  };

  const moveTask = (dragIndex, hoverIndex, dragBlock, hoverBlock) => {
    // Implement logic to update the task order in your state
    // You may need to consider different blocks as well
    // Update the tasks state accordingly
  };

  const Task = ({ task, index, moveTask, block }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "TASK",
      item: { index, block },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const getTaskStyle = (isDragging) => ({
      cursor: "move",
      opacity: isDragging ? 0.5 : 1,
    });

    const [, drop] = useDrop({
      accept: "TASK",
      hover: (draggedItem) => {
        moveTask(draggedItem.index, index, draggedItem.block, block);
        draggedItem.index = index;
        draggedItem.block = block;
      },
    });

    return (
      <div ref={(node) => drag(drop(node))} style={getTaskStyle(isDragging)}>
        <li>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p>Due Date: {task.dueDate}</p>
          <p>Priority: {task.priority}</p>
          <button onClick={() => removeTask(task.id)}>Delete</button>
        </li>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Todo List</h1>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
        </div>
        <div>
          <label>Priority:</label>
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
          >
            <option value="">Select Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button onClick={addTask}>Add Task</button>

        <ul>
          {tasks.map((task, index) => (
            <Task key={index} task={task} index={index} moveTask={moveTask} />
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

export default TodoList;
