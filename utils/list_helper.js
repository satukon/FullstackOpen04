const lodash = require('lodash');
  
const dummy = (blogs) => {
  return 1
}
  
const totalLikes = (blogs) => {
  const sum = blogs.reduce((total, blog) => total + blog.likes, 0)
  return sum
}
  
const favouriteBlog = (blogs) => {
  let favouriteBlog = null
  let max = null

  blogs.forEach((blog) => {
    if (blog.likes > max) {
      max = blog.likes
      favouriteBlog = blog.title
    }
  })
  return favouriteBlog
}

const mostBlogs = (blogs) => {
  const grouppedByAuthor = lodash.groupBy(blogs, 'author')

  let authorWithMostBlogs = null
  let maxBlogs = null

  for (const author in grouppedByAuthor) {
    if (grouppedByAuthor[author].length > maxBlogs) {
      maxBlogs = grouppedByAuthor[author].length
      authorWithMostBlogs = author
    }
  }
  return `author: ${authorWithMostBlogs}, blogs: ${maxBlogs}`
}
  
const mostLikes = (blogs) => {
  const grouppedByAuthor = lodash.groupBy(blogs, 'author')

  let authorWithMostLikes = null
  let mostLikes = null

  for (const author in grouppedByAuthor) {
    const sumOfLikes = lodash.sumBy(grouppedByAuthor[author], 'likes')

    if (sumOfLikes > mostLikes) {
      mostLikes = sumOfLikes
      authorWithMostLikes = author
    }
  }
  return `author: ${authorWithMostLikes}, likes: ${mostLikes}`
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}