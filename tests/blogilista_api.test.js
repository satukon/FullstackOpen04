const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// test users
const testUsers = [
  {
    username: 'Pekkis',
    name: 'Pekka Pouta',
    passwordHash: bcrypt.hashSync('salasana', 10),
    blogs: [], 
  },
  {
    username: 'Piru666',
    name: 'Piru',
    passwordHash: bcrypt.hashSync('salasana666', 10), 
    blogs: [], 
  },
];

// test blogs
const testBlogs = [
  {
    title: 'Pekan Sääblogi',
    author: 'Pekka Pouta',
    url: 'http://www.pekkapoutasaa.com',
    likes: 0,
    user: null,
  },
  {
    title: 'Pekan Politiikkablogi',
    author: 'Pekka Pouta',
    url: 'http://www.pekkapoutapolitiikka.com',
    likes: 0,
    user: null,
  },
  {
    title: 'Pekan Ruokablogi',
    author: 'Pekka Pouta',
    url: 'http://www.pekkapoutaruoka.com',
    likes: 0,
    user: null,
  },
  {
    title: 'I, Lucifer',
    author: 'Piru',
    url: 'http://www.piru.com',
    likes: 666,
    user: null,
  },
]

// initializing db with test data
beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  
  // Saving the test users to db first, so that they get valid ID:s
  const savedUsers = await Promise.all(
    testUsers.map(async (userData) => {
      const user = new User(userData);
      return await user.save();
    })
  );
  
  // Next user ID:s need to be added to each blog in the testBlogs array
  // Here, if the blog's author is the same as user's name, they are matched to each other
  for (let i = 0; i < testBlogs.length; i++) {
    const blogData = testBlogs[i];
    const user = savedUsers.find((user) => user.name === blogData.author);

  //Adding the user ID to the blog:
  const blog = new Blog({ ...blogData, user: user.id });
  
  //Adding the blog to the user's blogs list
  user.blogs = user.blogs.concat(blog.id);
  
  // Saving the updated user and blog to db
  await user.save();
  await blog.save();
  }
})
  

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})


test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(testBlogs.length)
})


test('a specific blog is within the returned blogs', async () => {
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


test('creating a blog without a token results in 401 Unauthorized', async () => {
  const before = await api.get('/api/blogs')

  // Trying to post a new blog entry without a token
  const newBlog = {
    title: 'Chocochili',
    author: 'Elina Innanen',
    url: 'https://chocochili.net/',
    likes: 1000,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  //Check that the length of the blog entries hasn't changed
  const after = await api.get('/api/blogs')
  expect(after.body).toHaveLength(before.body.length)

  //Check that the blog entries do not contain the blog title that was tried being added
  const titles = after.body.map(blog => blog.title)
  expect(titles).not.toContain('Chocochili')
})


test('a valid blog can be created using a valid token', async () => {
  const before = await api.get('/api/blogs');

  // log in with test user to obtain a valid token
  const testUser = {
    username: 'Piru666',
    password: 'salasana666',
  };

  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(200);

  const token = loginResponse.body.token;

  // Posting a new valid blog entry with a valid token
  const newBlog = {
    title: 'Chocochili',
    author: 'Elina Innanen',
    url: 'https://chocochili.net/',
    likes: 1000,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  //Check that the length of the blog entries has grown by one
  const after = await api.get('/api/blogs');
  expect(after.body).toHaveLength(before.body.length + 1);

  //Check that the blog entries now contain the blog that was added
  const titles = after.body.map(blog => blog.title);
  expect(titles).toContain('Chocochili');
});


test('if "likes" has no value, it is set to zero', async () => {  
  const before = await api.get('/api/blogs');

  // log in with test user to obtain a valid token
  const testUser = {
    username: 'Piru666',
    password: 'salasana666',
  };

  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(200);

  const token = loginResponse.body.token;

  //Posting a blog entry without a value being set to "likes"
  const newBlog = {
    title: 'Chocochili',
    author: 'Elina Innanen',
    url: 'https://chocochili.net/',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  //Check that blogs length has grown by one
  const after = await api.get('/api/blogs');
  expect(after.body).toHaveLength(before.body.length + 1);

  //Check that likes = 0
  const addedBlog = after.body.find(blog => blog.title === 'Chocochili')
  expect(addedBlog.likes).toBe(0)
  })


test('adding a blog without title and/or url results in 400 Bad Request', async () => {
  // log in with test user to obtain a valid token
  const testUser = {
    username: 'Piru666',
    password: 'salasana666',
  }
  
  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(200);
  
  const token = loginResponse.body.token
  
  // trying to add a blog without title and url, token is valid:
  const newBlog = {
    author: 'Elina Innanen',
    likes: 1000,
  }
  
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
  
  // trying to add a blog without title, token is valid:
  const newBlog2 = {
    author: 'Elina Innanen',
    url: "http://www.chocochili.fi",
    likes: 1000,
  }
  
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)

  // trying to add a blog without url, token is valid:
  const newBlog3 = {
    title: 'Chocochili',
    author: 'Elina Innanen',
    likes: 1000,
  }
  
  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)

  // Check that none of the invalid blog entries are present in the blogs list
  const blogs = await api.get('/api/blogs')
  expect(blogs).not.toContain(newBlog)
  expect(blogs).not.toContain(newBlog2)
  expect(blogs).not.toContain(newBlog3)
  })


test('deleting a blog using a valid token results in 204 No Content', async () => {
  const response = await api.get('/api/blogs')
  
  //Obtaining the id of the blog that is about to be deleted
  const blogToDelete = response.body.find(blog => blog.title === 'I, Lucifer');
  const idToDelete = blogToDelete.id
  
  // log in with test user to obtain a valid token
  const testUser = {
    username: 'Piru666',
    password: 'salasana666',
  }
  
  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(200)
  
  const token = loginResponse.body.token

  // Delete the blog using the blog's id and the token
  await api
  .delete(`/api/blogs/${idToDelete}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  // Check that the blog is no longer present in the blogs list
  const after = await api.get('/api/blogs')
  expect(after.body.map(blog => blog.id)).not.toContain(idToDelete);
})


test('deleting a blog using a invalid token results in 401 Unauthorized', async () => {
  const response = await api.get('/api/blogs')
  
  //Obtaining the id of the blog that is about to be deleted
  const blogToDelete = response.body.find(blog => blog.title === 'Pekan Ruokablogi');
  const idToDelete = blogToDelete.id
  
  // log in with test non-existing user, try to obtain a token
  const testUser = {
    username: 'nonexisting',
    password: 'nonexisting',
  }
  
  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
  
  const token = loginResponse.body.token

  //Trying to delete without a token
  await api
  .delete(`/api/blogs/${idToDelete}`)
    .expect(401)

  // Trying to delete with invalid token
  await api
  .delete(`/api/blogs/${idToDelete}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(401)

  // Check that the blog is still present in the blogs list
  const after = await api.get('/api/blogs')
  expect(after.body.map(blog => blog.id)).toContain(idToDelete);
})


test('updating a blog without using a valid token results in 401 Unauthorized', async () => {
  const blogs = await api.get('/api/blogs')
  const blogToUpdate = blogs.body.find(blog => blog.title === 'Pekan Ruokablogi')

  //trying to update a blog without using a token
  let blogUpdate = {
    title: 'Pekan Urheilublogi',
    url: 'http://www.pekkapoutaurheilu.com'
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogUpdate)
    .expect(401)

  //Check that the blogs list doesn't contain the blog title that was to be updated
  const after = await api.get('/api/blogs')
  expect(after.body.map(blog => blog.title)).not.toContain('Pekan Urheilublogi');
})


test('updating a blog using a valid token results in 200 OK', async () => {
  const blogs = await api.get('/api/blogs')
  const blogToUpdate = blogs.body.find(blog => blog.title === 'Pekan Ruokablogi')
  
  let blogUpdate = {
    title: 'Pekan Urheilublogi',
    url: 'http://www.pekkapoutaurheilu.com'
  }
  
  // log in with test user to obtain a valid token
  const testUser = {
    username: 'Piru666',
    password: 'salasana666',
  }
  
  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(200)
  
  const token = loginResponse.body.token

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogUpdate)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  
  //Check that the blogs list now contains the updated blog title and url
  const after = await api.get('/api/blogs')
  expect(after.body.map(blog => blog.title)).toContain('Pekan Urheilublogi');
  expect(after.body.map(blog => blog.url)).toContain('http://www.pekkapoutaurheilu.com');
})


test('creating a user with invalid username and/or password results in 401 Unauthorized', async () => {
  // attempting log in, using invalid username and pw:
  const testUser = {
    username: 'nonexisting',
    password: 'nonexisting',
  }
    
  const loginResponse = await api
    .post('/api/login')
    .send(testUser)
    .expect(401)

  // attempting log in, using valid username and incorrect pw:
  const testUser2 = {
    username: 'Pekkis',
    password: 'vääräsalasana',
  }
  
  const loginResponse2 = await api
    .post('/api/login')
    .send(testUser2)
    .expect(401)
})


afterAll(async () => {
  await mongoose.connection.close()
})