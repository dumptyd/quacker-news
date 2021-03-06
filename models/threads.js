var mongoose = require('mongoose');
var threadsSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  status: {
    type: String,
    enum: ['active', 'removed'],
    default: 'active'
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comments'
  }],
  title: String,
  text: String,
  url: String,
  type: {
    type: String,
    enum: ['ask', 'show', 'link']
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Threads', threadsSchema);