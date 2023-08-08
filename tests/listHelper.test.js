const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

const blogs2 = [...blogs]
blogs2.length = 1

const blogs3 = [...blogs2]
blogs3.length = 0

test('dummy returns one', () => {
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

  test('expected result with test array of 6 objects is: 36', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })

  test('expected result with test array of 1 object is: 7', () => {
    const result = listHelper.totalLikes(blogs2)
    expect(result).toBe(blogs2[0].likes)
  })

  test('expected result with test array of 0 objects is: 0', () => {
    const result = listHelper.totalLikes(blogs3)
    expect(result).toBe(0)
  })
})

describe('most liked blog', () => {

  test('expected result with test array of 6 objects is: Canonical string reduction', () => {
    const result = listHelper.favouriteBlog(blogs)
    expect(result).toBe('Canonical string reduction')
  })

  test('expected result with test array of 1 object is: React patterns', () => {
    const result = listHelper.favouriteBlog(blogs2)
    expect(result).toBe('React patterns')
  })

  test('expected result with test array of 0 objects is: null', () => {
    const result = listHelper.favouriteBlog(blogs3)
    expect(result).toBe(null)
  })
})

describe('writer with most blogs', () => {

  test('expected result with test array of 6 objects is: Robert C. Martin, 3 blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toBe('author: Robert C. Martin, blogs: 3')
  })

  test('expected result with test array of 1 object is: Michael Chan, 1 blogs', () => {
    const result = listHelper.mostBlogs(blogs2)
    expect(result).toBe('author: Michael Chan, blogs: 1')
  })

  test('expected result with test array of 0 objects is: null, null blogs', () => {
    const result = listHelper.mostBlogs(blogs3)
    expect(result).toBe('author: null, blogs: null')
  })
})

describe('writer with most likes', () => {

  test('expected result with test array of 6 objects is: Edsger W. Dijkstra, 17 likes', () => {
    const result = listHelper.mostLikes(blogs)
    expect(result).toBe('author: Edsger W. Dijkstra, likes: 17')
  })

  test('expected result with test array of 1 objects is: Michael Chan, 7 likes', () => {
    const result = listHelper.mostLikes(blogs2)
    expect(result).toBe('author: Michael Chan, likes: 7')
  })

  test('expected result with test array of 0 objects is: null, null likes', () => {
    const result = listHelper.mostLikes(blogs3)
    expect(result).toBe('author: null, likes: null')
  })
})