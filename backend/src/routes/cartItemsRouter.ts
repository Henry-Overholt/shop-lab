// require the express module
import express from "express";
import CartItem from "../models/CartItem";
import { getClient } from "../db";
import { ObjectId } from "mongodb";

const cartItemsRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

cartItemsRouter.get("/users/:userId/cart", async (req, res) => {
  try {
    const userId: string = req.params.userId;
    const client = await getClient();
    const results = await client
      .db()
      .collection<CartItem>("cartItems")
      .find({ userId }, { projection: { _id: 0 } })
      .toArray();
    res.status(200);
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

cartItemsRouter.post("/users/:userId/cart", async (req, res) => {
  try {
    const cartItem: CartItem = req.body;
    const userId: string = req.params.userId;
    const client = await getClient();
    const existingCartItem = await client
      .db()
      .collection<CartItem>("cartItems")
      .findOne(
        { userId, "product._id": new ObjectId(cartItem.product._id) },
        { projection: { _id: 0 } }
      );
    if (existingCartItem) {
      await client
        .db()
        .collection<CartItem>("cartItems")
        .updateOne(
          { userId, "product._id": new ObjectId(cartItem.product._id) },
          { $inc: { quantity: cartItem.quantity } }
        );
      res.status(200);
      existingCartItem.quantity += cartItem.quantity;
      res.json(existingCartItem);
    } else {
      cartItem.product._id = new ObjectId(cartItem.product._id);
      await client.db().collection<CartItem>("cartItems").insertOne(cartItem);
      res.status(201);
      res.json(cartItem);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

cartItemsRouter.patch("/users/:userId/cart/:productId", async (req, res) => {
  try {
    const userId: string = req.params.userId;
    const productId: string = req.params.productId;
    const updatedCartItem: CartItem = req.body;
    const client = await getClient();
    const result = await client
      .db()
      .collection<CartItem>("cartItems")
      .updateOne(
        { userId, "product._id": new ObjectId(productId) },
        { $set: { quantity: updatedCartItem.quantity } }
      );
    if (result.matchedCount) {
      res.status(200);
      res.json(updatedCartItem);
    } else {
      res.status(404);
      res.send("Not found");
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

cartItemsRouter.delete("/users/:userId/cart/:productId", async (req, res) => {
  try {
    const userId: string = req.params.userId;
    const productId: string = req.params.productId;
    const client = await getClient();
    const result = await client
      .db()
      .collection<CartItem>("cartItems")
      .deleteOne({ userId, "product._id": new ObjectId(productId) });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404);
      res.send("Not found");
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

cartItemsRouter.delete("/users/:userId/cart", async (req, res) => {
  try {
    const userId: string = req.params.userId;
    const client = await getClient();
    const result = await client
      .db()
      .collection<CartItem>("cartItems")
      .deleteMany({ userId });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404);
      res.send("Not found");
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

export default cartItemsRouter;
