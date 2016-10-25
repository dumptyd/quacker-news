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
  text: String,
}, {
  timestamps: true
});
module.exports = mongoose.model('Comments', commentsSchema);