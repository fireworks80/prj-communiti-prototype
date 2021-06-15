const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  content: {
    type: String,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
