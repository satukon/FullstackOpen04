const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})


test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(response.body.length)
})


test('a specific blog (I, Lucifer) is within the returned notes', async () => {
  const response = await api.get('/api/blogs')
  const contents = response.body.map(r => r.title)
  expect(contents).toContain('I, Lucifer')
})


test('blogs have an "id" field instead of "_id"', async () => {
  const response = await api.get('/api/blogs')
    
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
    expect(blog._id).toBeUndefined()
  })
})


test('a valid blog information can be added', async () => {
  const before = await api.get('/api/blogs')

  const newBlog = {
    title: 'Chocochili',
    author: 'Elina Innanen',
    url: 'https://chocochili.net/',
    likes: 1000,
  }


  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const after = await api.get('/api/blogs')
  expect(after.body).toHaveLength(before.body.length + 1);

  const titles = after.body.map(blog => blog.title)
  expect(titles).toContain('Chocochili')
})


test('if "likes" has no value, it is set to zero', async () => {  
  const newBlog = {
    title: 'TestiBlogi',
    author: 'Bloggaaja',
    url: 'https://testiblogi.net/',
    }
    
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const after = await api.get('/api/blogs')
  const addedBlog = after.body.find(blog => blog.title === 'TestiBlogi')
  expect(addedBlog.likes).toBe(0)
  })

test('adding a blog without title and/or url results in 400 Bad Request', async () => {
  // blog without title and url:
  const newBlog = {
    author: 'Blogger900',
    likes: 666,
  }
  
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  // blog without url:
  const newBlog2 = {
    title: 'Blogihh',
    author: 'IhQBlogger',
    likes: 666,
  }

  await api
    .post('/api/blogs')
    .send(newBlog2)
    .expect(400)

  // blog without title:
  const newBlog3 = {
    url: 'http://www.heipparallaa.com',
    author: 'HeippaRallattaja',
    likes: 666,
  }

  await api
    .post('/api/blogs')
    .send(newBlog3)
    .expect(400)

  const blogs = await api.get('/api/blogs')

  expect(blogs).not.toContain(newBlog.author)
  expect(blogs).not.toContain(newBlog2.author)
  expect(blogs).not.toContain(newBlog3.author)
  })


test('deleting a blog results in 204 No Content', async () => {
  const newBlog = {
    title: 'Tämä blogi poistetaan',
    author: 'Bloggaaja',
    url: 'https://testiblogi.net/',
    likes: 0
    }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogs = await api.get('/api/blogs')
  const blogToDelete = blogs.body.find(blog => blog.title === 'Tämä blogi poistetaan')

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    expect(blogs).not.toContain(newBlog.title)
  })


test('updating a blog results in 200 OK', async () => {

    const blogsBefore = await api.get('/api/blogs')

    var blogBeforeUpdate = blogsBefore.body.find(blog => blog.title === 'Jaskan Blogi')

    var blogUpdate = {
        likes: blogBeforeUpdate.likes + 1
        }

    await api
      .put(`/api/blogs/${blogBeforeUpdate.id}`)
      .send(blogUpdate)
      .expect(200)

    const blogsAfter = await api.get('/api/blogs')
    var blogAfterUpdate = blogsAfter.body.find(blog => blog.title === 'Jaskan Blogi')

    expect(blogAfterUpdate.likes).toBe(blogBeforeUpdate.likes +1)
})


afterAll(async () => {
  await mongoose.connection.close()
  })
