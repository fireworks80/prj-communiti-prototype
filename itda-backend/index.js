const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Post = require('./models/Posts');
const Comment = require('./models/Comment');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// application/json
app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

mongoose
  .connect(
    'mongodb+srv://seungchulhan800624:avalon1!@cluster0.43cuz.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log('mongodb connect....'))
  .catch((err) => console.log(err));

app.get('/api/hello', (req, res) => {
  res.json(req.cookies);
});

app.post('/api/users/register', (req, res) => {
  // 회원 가입 정보를 client에서 받아서 db에 넣어 준다.
});

app.get('/api/posts', (req, res) => {
  console.log('get posts');
  Post.find({})
    .sort({ board_datetime: -1 })
    .exec((err, posts) => {
      if (err) {
        return res.json({ posts: null, error: err });
      }

      return res.status(200).json({ posts, error: null });
    });
});

app.get('/api/posts/:id', (req, res) => {
  // console.log(req.params.id);
  Post.findOne({ _id: req.params.id }).exec((err, post) => {
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, post });
  });
});

app.post('/api/post', (req, res) => {
  // console.log('post');
  // console.log(req.body);
  const post = new Post(req.body);
  post.save((err, postInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.patch('/api/posts/:id', (req, res) => {
  // console.log(req.body);
  // console.log(req.params.id);
  Post.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec((err, post) => {
    if (err) return res.status(500).send(err);

    if (!post) return res.status(404).json({ success: false, err: '수정할 포스트 없음' });
    return res.status(201).json({ success: true, post });
  });
});

app.delete('/api/posts/:id', (req, res) => {
  // console.log(req.params);

  Post.deleteOne({ _id: req.params.id }).exec((err, result) => {
    if (err) return res.status(500).send(err);
    Comment.remove({ postId: req.params.id }).exec((err, result) => {
      if (err) return res.status(500).send(err);
      return res.json({ removeSuccess: true });
    });
  });
});

app.get('/api/comment/:postId', (req, res) => {
  const { postId } = req.params;
  Comment.find({ postId })
    .sort({ datetime: -1 })
    .exec((err, comments) => {
      if (err) return res.status(400).send(err);

      res.status(200).json({ success: true, comments });
    });
});

app.post('/api/comment', (req, res) => {
  // console.log(req.body);
  const comment = new Comment(req.body);

  comment.save((err, commentInfo) => {
    if (err) return res.json({ success: false, err });

    Comment.findOne({ _id: commentInfo._id }).exec((err, commentData) => {
      // console.log(commentData);
      if (err) return res.json({ success: false, err });
      Post.updateOne({ _id: commentInfo.postId }, { $inc: { board_comment_count: 1 } }).exec((err, result) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({ success: true, commentData });
      });
    });
  });
});

app.patch('/api/comment', (req, res) => {
  // console.log(req.body);
  const { _id, content } = req.body;
  Comment.updateOne({ _id }, { $set: { content } }).exec((err, result) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({ success: true, result });
  });
});

app.delete('/api/comment/:id', (req, res) => {
  // console.log(req.params.id);
  Comment.findOneAndDelete({ _id: req.params.id }).exec((err, comment) => {
    if (err) return res.send(err);
    Post.updateOne({ _id: comment.postId._id }, { $inc: { board_comment_count: -1 } }).exec((err, result) => {
      if (err) return res.json({ remove: false, err });
      // console.log('updated');
      return res.json({ remove: true });
    });
  });
});

app.listen(port, () => {
  console.log(`listening port ls ${port}`);
});
