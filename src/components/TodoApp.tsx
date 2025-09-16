import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Learn React Page Lite", completed: true },
    { id: 2, text: "Build a static site", completed: false },
    { id: 3, text: "Add interactive islands", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Todo App</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
      </div>
    </div>
  );
}