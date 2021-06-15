const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
  board_title: {
    type: String,
    maxlength: 255,
  },
  board_content: {
    type: String,
  },
  board_category_cd: {
    type: String,
    maxlength: 10,
  },
  board_tag: {
    type: String,
    maxlength: 255,
  },
  board_comment_count: {
    type: Number,
    default: 0,
  },
  board_datetime: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
