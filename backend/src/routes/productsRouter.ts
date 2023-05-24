// require the express module
import express from "express";
import Product from "../models/Product";
import { getClient } from "../db";
import { ObjectId } from "mongodb";

const productsRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

productsRouter.get("/products", async (req, res) => {
  try {
    let maxPrice: number | null = Number(req.query["max-price"]);
    if (isNaN(maxPrice)) maxPrice = null;
    const includes: string | null = (req.query.includes as string) || null;
    let limit: number | null = parseInt(req.query.limit as string);
    if (isNaN(limit)) limit = null;
    let query: any = {
      ...(maxPrice !== null ? { price: { $lte: maxPrice } } : {}),
      ...(includes !== null ? { name: new RegExp(`${includes}`, "i") } : {}),
    };
    const client = await getClient();
    const cursor = client.db().collection<Product>("products").find(query);
    if (limit !== null) {
      cursor.limit(limit);
    }
    const result = await cursor.toArray();
    res.status(200);
    res.json(result);
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.get("/products/:id", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const client = await getClient();
    const result = await client
      .db()
      .collection<Product>("products")
      .findOne({ _id });
    if (result) {
      res.status(200);
      res.json(result);
    } else {
      res.status(404);
      res.send(`Product not Found`);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.post("/products", async (req, res) => {
  try {
    const product: Product = req.body;
    const client = await getClient();
    await client.db().collection<Product>("products").insertOne(product);
    res.status(201);
    res.json(product);
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.put("/products/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const product: Product = req.body;
    const client = await getClient();
    const result = await client
      .db()
      .collection<Product>("products")
      .replaceOne({ _id: new ObjectId(id) }, product);
    if (result.modifiedCount) {
      res.status(200);
      res.json(product);
    } else {
      res.status(404);
      res.send(`Product not found`);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.delete("/products/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<Product>("products")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404);
      res.send("Product not found");
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

export default productsRouter;
