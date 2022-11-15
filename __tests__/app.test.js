const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET /api/categories", () => {
  test("200: should respond with category information", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((result) => {
        expect(result.body.categories.length > 0).toBe(true);
        result.body.categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("404: route not found", () => {
    return request(app)
      .get("/api/category")
      .expect(404)
      .then((result) => {
        expect(result.body).toMatchObject({
          msg: "Route not found",
        });
      });
  });
});

describe("GET /api/reviews", () => {
  test("200: should respond with review information", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.length > 0);
        result.body.reviews.forEach((category) => {
          expect(category).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("200: should respond with reviews ordered by date descending", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.body.reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with a single review information", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 1,
          title: "Agricola",
          category: "euro game",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_body: "Farmyard fun!",
          review_img_url: "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 1,
        });
      });
  });
  test("404: review not found", () => {
    return request(app)
      .get("/api/reviews/112312831273821787")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Review Not Found");
      });
  });
  test("400: bad input", () => {
    return request(app)
      .get("/api/reviews/onetwothree")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: should return object of comments", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.comments.length > 0).toBe(true);
        result.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: expect.any(Number),
          });
        });
      });
  });
  test("404: comments not found", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("400: bad request", () => {
    return request(app)
      .get("/api/reviews/helllooooo/comments")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});
