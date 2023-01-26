const router = require("express").Router()
const { Post, User, Comment } = require("../../models")
const withAuth = require("../../utils/auth")

// GET api/comment, get all the comments
router.get("/", async (req, res) => {
  try {
    const commentData = await Comment.findAll({})
    if (commentData.length === 0) {
      res.status(404).json({ message: "No comment yet!" })
      return
    }

    res.status(200).json(commentData)
  } catch (error) {
    res.status(500).json(error)
  }
})

// Post api/comment, create new comments
router.post("/", withAuth, async (req, res) => {
  try {
    const newComment = await Comment.create({
      ...req.body,
      user_id: req.session.user_id,
    })

    res.status(200).json(newComment)
  } catch (error) {
    res.status(400).json(error)
  }
})

module.exports = router