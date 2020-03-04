const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: ".env.dev" });
const connect_db = require("../src/DB/index").default;

test("The database is connected succesfully", async done => {
  try {
    let msg = await connect_db();
    console.log(msg);

    await expect(connect_db()).resolves.toEqual({
      msg: "Data base conected"
    });
    done();
  } catch (error) {
    done(error);
  }
});

afterAll(async done => {
  await mongoose.connection.close();
  done();
});
