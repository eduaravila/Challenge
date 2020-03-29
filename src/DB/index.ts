import mongoose from "mongoose";

const connect_db = async () => {
  try {
    mongoose.set("useCreateIndex", true);

    let db =
      process.env.DEV == "true"
        ? await mongoose.connect(`mongodb://127.0.0.1:27017/challenge`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })
        : await mongoose.connect(
            `mongodb+srv://ECOLOTE:${process.env.DB_PASS}@cluster0-u30oq.mongodb.net/challenge`,
            {
              useNewUrlParser: true,
              useUnifiedTopology: true
            }
          );

    return Promise.resolve({ msg: "Data base conected" });
  } catch (error) {
    console.log(error);

    Promise.reject("Error with the data base conection");
  }
};

export default connect_db;
