import mongoose from "mongoose";

const connect_db = async () => {
  try {
    mongoose.set("useCreateIndex", true);
    let db = await mongoose.connect(`mongodb://127.0.0.1:27017/challenge`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return Promise.resolve({ msg: "Data base conected", db });
  } catch (error) {
    Promise.reject("Error with the data base conection");
  }
};

export default connect_db;
