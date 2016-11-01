var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
  local: {
    username: String,
    password: String,
  },
  karma: {
    type: Number,
    default: 0
  },
  about: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comments'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threads'
  }]
}, {
  timestamps: true
});
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('Users', userSchema);