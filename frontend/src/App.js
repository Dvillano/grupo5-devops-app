import React, { useEffect, useState } from "react";
import { getTasks, getTask, createTask, updateTask, deleteTask } from "./api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Badge, ListGroup, Container, Alert, Spinner } from "react-bootstrap";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createTask({ ...form, done: false });
      setForm({ title: "", description: "" });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, { done: !task.done });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectTask = async (id) => {
    setError("");
    try {
      const data = await getTask(id);
      setSelectedTask(data.task);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    setError("");
    try {
      await updateTask(selectedTask.id, {
        title: selectedTask.title,
        description: selectedTask.description,
        done: selectedTask.done,
      });
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Task Manager</h1>

      {/* Create Task Form */}
      <Form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded shadow-sm">
        <Form.Control
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="mb-2"
          required
        />
        <Form.Control
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="mb-2"
        />
        <Button type="submit" variant="primary" className="w-100">Add Task</Button>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Task List */}
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <ListGroup className="mb-4">
          {tasks.map(task => (
            <ListGroup.Item
              key={task.id}
              className="d-flex justify-content-between align-items-center task-item"
            >
              {/* Badge + Title */}
              <div className="d-flex align-items-center gap-2">
                <Badge bg={task.done ? "success" : "warning"} text={task.done ? "" : "dark"}>
                  {task.done ? "Done" : "Pending"}
                </Badge>
                <span style={{ textDecoration: task.done ? "line-through" : "none", color: task.done ? "gray" : "black" }}>
                  {task.title}{task.description && `: ${task.description}`}
                </span>
              </div>

              {/* Done Checkbox + View + Delete */}
              <div className="d-flex align-items-center gap-2">
                <Form.Check
                  type="checkbox"
                  label=""
                  checked={task.done || false}
                  onChange={() => handleToggle(task)}
                />
                <Button variant="info" size="sm" onClick={() => handleSelectTask(task.id)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Edit Modal */}
      <Modal show={selectedTask !== null} onHide={() => setSelectedTask(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Task #{selectedTask?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            {/* Hidden dummy input to prevent writing prompt */}
            <input type="text" style={{ display: "none" }} />
            
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={selectedTask?.title || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, title: e.target.value })
                }
                name={`title-${selectedTask?.id || Math.random()}`}
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={selectedTask?.description || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, description: e.target.value })
                }
                name={`description-${selectedTask?.id || Math.random()}`}
                autoComplete="off"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
          <Button variant="success" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
