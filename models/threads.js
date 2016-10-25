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
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  title: String,
  text: String,
  url: String,
  type:{type:String,enum:['ask','link']}
}, {
  timestamps: true
});
module.exports = mongoose.model('Threads', threadsSchema);