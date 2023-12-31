const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  .populate({
    path: 'blogs',
    select: '-user',
  });
response.json(users);
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  
  if (!username || !password) {
    return response.status(400).json({ error: 'username and/or password missing' })
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: 'username and password must be 3 characters or longer' })
  }
  
  const existingUser = await User.find({ username })
  
  if (existingUser) {
    return response.status(400).json({ error: 'username is already in use' })
  }
  
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  
  const user = new User({
    username,
    name,
    passwordHash,
  })
  
  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter