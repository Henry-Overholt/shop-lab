// require the express module
import express from "express";
import User from "../models/User";
import { getClient } from "../db";
import { ObjectId } from "mongodb";

const usersRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

usersRouter.get("/users/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("users")
      .findOne({ _id: new ObjectId(id) });
    if (result) {
      res.status(200);
      res.json(result);
    } else {
      res.status(404);
      res.send(`User not found`);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

usersRouter.post("/users", async (req, res) => {
  try {
    const user: User = req.body;
    const client = await getClient();
    await client.db().collection<User>("users").insertOne(user);
    res.status(201);
    res.json(user);
  } catch (err) {
    errorResponse(err, res);
  }
});

usersRouter.put("/users/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const updatedUser: User = req.body;
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("users")
      .replaceOne({ _id: new ObjectId(id) }, updatedUser);
    if (result.matchedCount) {
      res.status(200);
      res.json(updatedUser);
    } else {
      res.status(404);
      res.send("User not found");
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

usersRouter.delete("/users/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("users")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404);
      res.send("User not found");
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

export default usersRouter;
