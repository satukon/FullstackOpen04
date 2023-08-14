const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title and/or url are missing' })
  }

  try {
    const decodedUser = jwt.verify(request.token, process.env.SECRET)

    if (!decodedUser.id) {
      return response.status(401).json({ error: 'invalid token, permission denied' })
    }

    const user = await User.findById(decodedUser.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json({ error: 'Token has expired' });
    }
    return response.status(401).json({ error: 'missing or invalid token' })
  }
})


blogsRouter.delete('/:id', async (request, response) => {
  try {
    const decodedUser = jwt.verify(request.token, process.env.SECRET)

    if (!decodedUser.id) {
      return response.status(403).json({ error: 'invalid token, permission denied' });
    }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json({ error: 'Token has expired' })
    }
    return response.status(401).json({ error: 'missing or invalid token' })
  }
})


blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  
  try {
    const decodedUser = jwt.verify(request.token, process.env.SECRET)
  
    if (!decodedUser.id) {
      return response.status(401).json({ error: 'Invalid token, permission denied' })
    }
  
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'Token has expired' })
      }
      return response.status(401).json({ error: 'Missing or invalid token' })
    }
  })

module.exports = blogsRouter