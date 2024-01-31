import mongoose, { mongo } from "mongoose";

const connectDB = (uri) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(uri)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
};

export default connectDB;
