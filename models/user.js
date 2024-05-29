const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://gauravsh:gauravsh7568@cluster0.i5nz68r.mongodb.net/register",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  mob: Number,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
