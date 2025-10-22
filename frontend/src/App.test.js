import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('./api', () => ({
  getTasks: jest.fn().mockResolvedValue({ tasks: [] }),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getTask: jest.fn()
}));

test('renders Task Manager title', async () => {
  render(<App />);
  const titleElement = screen.getByText(/Task Manager/i);
  expect(titleElement).toBeInTheDocument();
  
  // Wait for the component to finish loading
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

test('renders add task form', async () => {
  render(<App />);
  const titleInput = screen.getByPlaceholderText(/title/i);
  const descriptionInput = screen.getByPlaceholderText(/description/i);
  const addButton = screen.getByText(/add task/i);
  
  expect(titleInput).toBeInTheDocument();
  expect(descriptionInput).toBeInTheDocument();
  expect(addButton).toBeInTheDocument();
  
  // Wait for the component to finish loading
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});