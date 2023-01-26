const router = require("express").Router()
const { Post, User, Comment } = require("../models")
const withAuth = require("../utils/auth")

// dashboard displaying posts created by logged in users
router.get("/", withAuth, async (req, res) => {
  try {
    const postData = await Post.findAll({
      where: {
        user_id: req.session.user_id,
      },
      attributes: ["id", "title", "post_text", "created_at"],
      include: [
        {
          model: Comment,
          attributes: [
            "id",
            "comment_text",
            "user_id",
            "post_id",
            "created_at",
          ],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    })

    const posts = postData.map((post) => post.get({ plain: true }))
    console.log(posts)
    res.render("dashboard", {
      posts,
      logged_in: true,
      username: req.session.username,
    })
  } catch (error) {
    res.status(500).json(error)
  }
})

// rendering edit post page by the user's id
router.get("/edit/:id", withAuth, async (req, res) => {
  try {
    const postData = await Post.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "title", "post_text", "created_at"],
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    })

    const post = postData.get({ plain: true })
    console.log(post)

    res.render("edit-post", {
      post,
      logged_in: true,
      username: req.session.username,
    })
  } catch (error) {
    res.status(500).json(error)
  }
})

// rendering new post page
router.get("/newpost", (req, res) => {
  res.render("new-post", { username: req.session.username })
})

module.exports = router