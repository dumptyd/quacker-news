var mongoose = require('mongoose');
var commentsSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  downvoteCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'removed'],
    default: 'active'
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threads'
  },
  text: String,
}, {
  timestamps: true
});
module.exports = mongoose.model('Comments', commentsSchema);