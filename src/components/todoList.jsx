import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { doc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const style = {
  border: "1px dashed gray",
  padding: "0.5rem",
  marginBottom: "0.5rem",
  backgroundColor: "white",
  cursor: "move",
};

const TodoList = () => {
  const [tasks, setTasks] = useState({
    High: [],
    Medium: [],
    Low: [],
  });
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [list, setList] = useState("");
  const [blockArray, setBlockArray] = useState([]); // Add state for blockArray

  // ... (rest of the code)

  const addList = () => {
    if (list) {
      // Assuming each block has a unique id
      const newBlock = {
        id: blockArray.length + 1, // You may need a more robust id generation
        title: list,
        cards: [], // Initialize with an empty cards array
      };

      setBlockArray((prevTasks) => [...prevTasks, newBlock]);
      setList("");
    } else {
      alert("Please enter a list name.");
    }
  };

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

        // Find the block in blockArray that matches the task's priority
        const blockToUpdate = blockArray.find(
          (block) => block.title === taskPriority
        );

        if (blockToUpdate) {
          // Update the state of the specific block with the new task
          setBlockArray((prevBlockArray) => {
            const updatedBlockArray = [...prevBlockArray];
            const updatedBlockIndex = updatedBlockArray.indexOf(blockToUpdate);

            if (updatedBlockIndex !== -1) {
              updatedBlockArray[updatedBlockIndex].cards.push(newTask);
            }

            return updatedBlockArray;
          });
        }
        // Update the state based on the priority level
        setTasks((prevTasks) => ({
          ...prevTasks,
          [taskPriority]: [...prevTasks[taskPriority], newTask],
        }));
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

  const removeTask = async (taskId, priority) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));

      const updatedTasks = tasks[priority].filter((task) => task.id !== taskId);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [priority]: updatedTasks,
      }));

      console.log("Document successfully deleted from db with id: ", taskId);
    } catch (error) {
      console.error("Error removing task from Firestore:", error);
    }
  };

  const moveTask = (dragIndex, hoverIndex, dragBlock, hoverBlock) => {
    const draggedTask = tasks[dragBlock][dragIndex];
    const newTasks = { ...tasks };
    newTasks[dragBlock].splice(dragIndex, 1);
    newTasks[hoverBlock].splice(hoverIndex, 0, draggedTask);
    setTasks(newTasks);

    db.ref("tasks").set(newTasks);
  };

  const Task = ({ task, index, moveTask, block }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "TASK",
      item: { id: task.id, index, block },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const getTaskStyle = (isDragging) => ({
      ...style,
      opacity: isDragging ? 0.5 : 1,
      cursor: "move",
    });

    const [, drop] = useDrop({
      accept: "TASK",
      hover: (item, monitor) => {
        const dragIndex = item.index;
        const hoverIndex = index;
        const dragBlock = item.block;
        const hoverBlock = block;

        if (dragIndex === hoverIndex && dragBlock === hoverBlock) {
          return;
        }

        moveTask(dragIndex, hoverIndex, dragBlock, hoverBlock);
        item.index = hoverIndex;
      },
    });

    return (
      <div ref={(node) => drag(drop(node))} style={getTaskStyle(isDragging)}>
        <li>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p>Due Date: {task.dueDate}</p>
          <p>Priority: {task.priority}</p>
          <button onClick={() => removeTask(task.id, block)}>Delete</button>
        </li>
      </div>
    );
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate("/");
        console.log("Signed out successfully");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <h1>Todo List</h1>
      <div className="border">
        <div>
          <input
            type="text"
            value={list}
            placeholder="New List Name"
            onChange={(e) => setList(e.target.value)}
          />
          <button onClick={addList}>
            <b>Add List</b>
          </button>
        </div>
      </div>

      <div className="border">
        {/* This for the Title input */}
        <div>
          <label>
            <b>Title:</b>
          </label>
          <input
            type="text"
            value={taskTitle}
            placeholder="Title"
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>

        {/* This for the Description input */}
        <div>
          <label>
            <b>Description:</b>
          </label>
          <input
            type="text"
            value={taskDescription}
            placeholder="Desc..."
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>

        {/* This for the Due Date input */}
        <div>
          <label>
            <b>Due Date:</b>
          </label>
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
        </div>

        {/* This for the Priority input */}
        <div>
          <label>
            <b>Priority:</b>
          </label>
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* This for the list input */}
        <div>
          <label>
            <b>Select List</b>
          </label>
          <select value={list} onChange={(e) => setList(e.target.value)}>
            <option value="">Select List...</option>
            {blockArray.map((block) => (
              <option key={block.id} value={block.title}>
                {block.title}
              </option>
            ))}
          </select>
        </div>
        <button
          style={{
            backgroundColor: "#2ecc71",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={addTask}
        >
          <b>Add Task</b>
        </button>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
            {blockArray.map((block) => (
              <div key={block.id}>
                <h2>List: {block.title}</h2>
                <ul>
                  {block.cards.map((task, index) => (
                    <Task
                      key={index}
                      task={task}
                      index={index}
                      moveTask={moveTask}
                      block={block.title}
                    />
                  ))}
                </ul>
              </div>
            ))}
          {Object.keys(tasks).map((block) => (
            <div key={block} style={{ marginBottom: "20px", flex: 1 }}>
              <h2>{block}</h2>
              <ul>
                {tasks[block].map((task, index) => (
                  <Task
                    key={index}
                    task={task}
                    index={index}
                    moveTask={moveTask}
                    block={block}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          {/* Logout button */}
          <nav style={{ color: "#fff", padding: "10px", textAlign: "center" }}>
            <div>
              <button
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  padding: "10px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "1em",
                }}
                onClick={handleLogout}
              >
                LogOut
              </button>
            </div>
          </nav>
        </div>
      </div>
    </DndProvider>
  );
};

export default TodoList;
