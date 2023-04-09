///

// this reads a .env file and makes the values available as process.env.VAR_NAME in nodejs
require('dotenv').config()

const debug = require('debug')

const express = require('express')
const mongoose = require('mongoose')

const { join } = require('path')

///

const logger = debug('exampleserver:app')

const port = process.env.PORT

async function main() {
  // create a default app
  const app = express()

  // connect to mongodb
  let db
  try {
    db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      dbName: 'exampleDb',
    })

    logger('Connected to mongodb')
  } catch (err) {
    logger('Error connecting to mongodb', err)
    process.exit(1)
    return // just because
  }

  // create the model for the comment
  const Comment = db.model('Comment', { text: String }, 'comments')

  // use ejs as the view engine
  app.set('view engine', 'ejs')

  // use the views folder for the views
  app.set('views', join(__dirname, 'views'))

  // for POST requests
  app.use(express.urlencoded({ extended: true }))

  // create a route for the comments
  app.get('/', (_req, res) => {
    Comment.find({}).then((comments, err) => {
      // if there is an error, log it and return a 500
      if (err) {
        logger('Error getting comments', err)
        return res.status(500).send('Error getting comments')
      }

      // render the index view with the comments
      res.render('index', { comments })
    })
  })

  app.post('/', (req, res) => {
    // create a new comment
    const comment = new Comment({ text: req.body.comment })

    // save the comment
    comment.save().then(() => {
      // redirect to the root so that it reloads the comments
      res.redirect('/')
    })
  })

  // start the server
  app.listen(port, () => {
    logger(`Server listening on port ${port}`)
  })
}

main()
