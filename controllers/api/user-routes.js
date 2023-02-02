const router = require("express").Router()
const { User, Post, Comment } = require("../../models")
const withAuth = require("../../utils/auth")

// GET /api/user, get all the users
router.get("/", async (req, res) => {
  try {
    const userData = await User.findAll({
      attributes: { exclude: ["password"] },
    })
    res.status(200).json(userData)
  } catch (err) {
    res.status(400).json(err)
  }
})

// GET /api/user/id, get a single user by id
router.get("/:id", async (req, res) => {
  try {
    const userData = await User.findOne({
      attributes: { exclude: ["password"] },
      where: { id: req.params.id },
      include: [
        {
          model: Post,
          attributes: ["id", "title", "content", "created_at"], //created_at from Post timestamps: true (default)
        },
        {
          model: Comment,
          attributes: ["id", "comment_text", "created_at"],
          include: {
            model: Post,
            attributes: ["title"],
          },
        },
      ],
    })

    if (!userData) {
      res
        .status(404)
        .json({ message: `No user found with id' ${req.params.id}` })
      return
    }
    res.status(200).json(userData)
  } catch (error) {
    res.status(400).json(error)
  }
})

// POST /api/user, create a new user
// This is where it connects to login.js and fires the fetch('/api/user) -> sign up
router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body)

    req.session.save(() => {
      req.session.user_id = userData.id
      req.session.username = userData.username
      req.session.logged_in = true

      res.status(201).json(`Successfully created ${userData.username}`)
    })
  } catch (error) {
    res.status(400).json(error)
  }
})
// POST /api/user/login, log in for users/ verify users
// This is where it connects to login.js and fires the fetch('/api/user/login) -> login
router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    })

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" })
      return
    }

    const validPassword = await userData.checkPassword(req.body.password)

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" })
      return
    }

    req.session.save(() => {
      req.session.user_id = userData.id
      req.session.username = userData.username
      req.session.logged_in = true

      res.json({ user: userData, message: "You are now logged in!" })
    })
  } catch (error) {
    res.status(400).json(error)
  }
})

// POST /api/user, log out
router.post("/logout", (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      // this is gonna remove the session row from the session database
      res.status(204).end()
    })
  } else {
    res.status(404).end()
  }
})

// PUT, update a user
router.put("/:id", withAuth, async (req, res) => {
  try {
    const userData = await User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id,
      },
    })

    if (!userData[0]) {
      res.status(404).json({ message: "No user found with this id" })
      return
    }
    res.json(userData)
  } catch (error) {
    res.status(400).json(error)
  }
})

// DELETE a user
router.delete("/:id", withAuth, async (req, res) => {
  try {
    const userData = await User.destroy({
      where: {
        id: req.params.id,
      },
    })

    if (!userData) {
      res.status(404).json({ message: "No user found with this id" })
      return
    }
    res.json(userData)
  } catch (error) {
    res.status(400).json(error)
  }
})

module.exports = router