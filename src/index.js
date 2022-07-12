const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

/**
  id: 'uuid', // precisa ser um uuid
	name: 'Danilo Vieira', 
	username: 'danilo', 
	todos: 
 */ 

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (customer) => customer.username === username
  )

  if(!user){
    return response.status(404).json(
      { error: 'Mensagem do erro' }
    )
  }

  request.user = user;

  return next();
}

function checkExistsTodo(request, response, next){
  const { id } = request.params;
  const { user } = request;

  findTodo = user.todos.find(
    (todo) => todo.id === id
  )

  if(!findTodo){
    return response.status(404).json(
      { error: "Mensagem de Erro" }
    )
  }

  request.todo = findTodo;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(
    (user) => user.username === username
  );

  if(userExists){
    response.status(400).json(
      { error: 'Mensagem do erro' }
    );
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;